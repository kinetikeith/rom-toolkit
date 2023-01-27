import { Buffer } from "buffer";
import crc32 from "crc/crc32";

import { readVUInt, readVInt } from "./utils";

enum Command {
  SourceRead = 0,
  TargetRead,
  SourceCopy,
  TargetCopy,
}

interface Action {
  command: Command;
  writeBegin: number;
  writeEnd: number;
}

interface SourceReadAction extends Action {
  command: Command.SourceRead;
}

interface TargetReadAction extends Action {
  command: Command.TargetRead;
  data: Buffer;
}

interface SourceCopyAction extends Action {
  command: Command.SourceCopy;
  readBegin: number;
  readEnd: number;
}

interface TargetCopyAction extends Action {
  command: Command.TargetCopy;
  readBegin: number;
  readEnd: number;
}

type AnyAction =
  | SourceReadAction
  | TargetReadAction
  | SourceCopyAction
  | TargetCopyAction;

enum BpsError {
  InvalidPatchChecksum,
  InvalidSourceSize,
  InvalidSourceChecksum,
  InvalidTargetChecksum,
  WritePastEof,
}

type BpsErrorHandler = (err: BpsError) => boolean | void;

const bpsErrHandler = (err: BpsError) => {
  switch (err) {
    case BpsError.InvalidSourceSize:
      console.warn("Source file has wrong size");
      break;
    case BpsError.InvalidSourceChecksum:
      console.warn("Source file has wrong checksum");
      break;
    case BpsError.InvalidTargetChecksum:
      console.warn("Target file has wrong checksum");
      break;
    case BpsError.WritePastEof:
      console.warn("Attempted to write past end of target file");
      break;
  }
};

export default class BpsPatch {
  _buffer: Buffer;

  constructor(buffer: Buffer) {
    this._buffer = buffer;
  }

  get validityScore() {
    return this.magic === "BPS1" ? 1 : 0;
  }

  get magic(): string {
    return this._buffer.toString("ascii", 0, 4);
  }

  get sizesWithOffset() {
    let sourceSize, targetSize, metadataSize;
    let offset;
    [sourceSize, offset] = readVUInt(this._buffer, 0x04);
    [targetSize, offset] = readVUInt(this._buffer, offset);
    [metadataSize, offset] = readVUInt(this._buffer, offset);

    return [sourceSize, targetSize, metadataSize, offset];
  }

  get patchSize(): number {
    return this._buffer.length;
  }

  get sourceSize(): number {
    const [sourceSize, , ,] = this.sizesWithOffset;
    return sourceSize;
  }

  get targetSize(): number {
    const [, targetSize, ,] = this.sizesWithOffset;
    return targetSize;
  }

  get metadataSize(): number {
    const [, , metadataSize] = this.sizesWithOffset;
    return metadataSize;
  }

  get metadata(): string {
    const [, , metadataSize, offset] = this.sizesWithOffset;
    return this._buffer.toString("ascii", offset, offset + metadataSize);
  }

  get sourceChecksum(): number {
    return this._buffer.readUInt32LE(this._buffer.length - 12);
  }

  get targetChecksum(): number {
    return this._buffer.readUInt32LE(this._buffer.length - 8);
  }

  get patchChecksum(): number {
    return this._buffer.readUInt32LE(this._buffer.length - 4);
  }

  get patchChecksumCalc(): number {
    return crc32(this._buffer.subarray(0, this._buffer.length - 4));
  }

  get actionsOffset(): number {
    const [, , metadataSize, offset] = this.sizesWithOffset;
    return offset + metadataSize;
  }

  *getActions(): Iterable<AnyAction> {
    let offset = this.actionsOffset;
    const patchEnd = this.patchSize - 12;

    let outputOffset = 0;
    let sourceOffset = 0;
    let targetOffset = 0;

    while (offset < patchEnd) {
      let data;
      [data, offset] = readVUInt(this._buffer, offset);

      const command = data & 0b0011;
      const length = (data >> 2) + 1;
      const writeBegin = outputOffset;
      const writeEnd = outputOffset + length;
      outputOffset += length;

      if (length > this.targetSize) console.log(offset);

      if (command === Command.SourceRead) {
        yield { command, writeBegin, writeEnd };
      } else if (command === Command.TargetRead) {
        const data = this._buffer.subarray(offset, offset + length);
        yield { command, writeBegin, writeEnd, data };
        offset += length;
      } else if (command === Command.SourceCopy) {
        let relativeOffset;
        [relativeOffset, offset] = readVInt(this._buffer, offset);
        sourceOffset += relativeOffset;
        yield {
          command,
          writeBegin,
          writeEnd,
          readBegin: sourceOffset,
          readEnd: sourceOffset + length,
        };

        sourceOffset += length;
      } else if (command === Command.TargetCopy) {
        let relativeOffset;
        [relativeOffset, offset] = readVInt(this._buffer, offset);
        targetOffset += relativeOffset;
        yield {
          command,
          writeBegin,
          writeEnd,
          readBegin: targetOffset,
          readEnd: targetOffset + length,
        };

        targetOffset += length;
      }
    }
  }

  get actions() {
    return Array.from(this.getActions());
  }

  get nActions() {
    return this.actions.length;
  }

  get info() {
    return {
      nActions: this.nActions,

      metadata: this.metadata,

      patchSize: this.patchSize,
      patchChecksum: this.patchChecksum,
      patchChecksumCalc: this.patchChecksumCalc,

      sourceSize: this.sourceSize,
      sourceChecksum: this.sourceChecksum,

      targetSize: this.targetSize,
      targetChecksum: this.targetChecksum,
    };
  }

  applyTo(sourceBuffer: Buffer, errFunc: BpsErrorHandler = bpsErrHandler) {
    const targetSize = this.targetSize;
    const targetBuffer = Buffer.alloc(targetSize);

    if (this.patchChecksum !== this.patchChecksumCalc) {
      if (errFunc(BpsError.InvalidPatchChecksum)) return targetBuffer;
    }

    if (this.sourceSize !== sourceBuffer.length) {
      if (errFunc(BpsError.InvalidSourceSize)) return targetBuffer;
    }

    const sourceChecksumCalc = crc32(sourceBuffer);
    if (this.sourceChecksum !== sourceChecksumCalc) {
      if (errFunc(BpsError.InvalidSourceChecksum)) return targetBuffer;
    }

    for (const action of this.actions) {
      // TODO: Fail on out-of-bounds access on both source and target buffers
      const { writeBegin, writeEnd } = action;
      if (writeEnd > targetSize) {
        if (errFunc(BpsError.WritePastEof)) return targetBuffer;
      }

      if (action.command === Command.SourceRead) {
        sourceBuffer.copy(targetBuffer, writeBegin, writeBegin, writeEnd);
      } else if (action.command === Command.TargetRead) {
        action.data.copy(targetBuffer, writeBegin);
      } else if (action.command === Command.SourceCopy) {
        sourceBuffer.copy(
          targetBuffer,
          writeBegin,
          action.readBegin,
          action.readEnd
        );
      } else if (action.command === Command.TargetCopy) {
        let writeOffset = writeBegin;
        for (let i = action.readBegin; i < action.readEnd; i++) {
          const byte = targetBuffer.readUInt8(i);
          targetBuffer.writeUInt8(byte, writeOffset);
          writeOffset++;
        }
      }
    }

    const targetChecksumCalc = crc32(targetBuffer);
    if (this.targetChecksum !== targetChecksumCalc) {
      if (errFunc(BpsError.InvalidTargetChecksum)) return targetBuffer;
    }

    return targetBuffer;
  }
}
