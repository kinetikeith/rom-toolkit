import { Buffer } from "buffer";
import crc32 from "crc/crc32";

interface Chunk {
  offset: number;
  length: number;
  buffer: Buffer;
}

enum UpsError {
  InvalidPatchChecksum,
  InvalidInputChecksum,
  InvalidInputSize,
  InvalidOutputChecksum,
  WritePastEof,
}

type UpsErrorHandler = (err: UpsError) => boolean | void;

const upsErrHandler = (err: UpsError) => {
  switch (err) {
    case UpsError.InvalidInputChecksum:
      console.warn("Input file has wrong checksum");
      break;
    case UpsError.InvalidInputSize:
      console.warn("Input file has wrong size");
      break;
    case UpsError.InvalidOutputChecksum:
      console.warn("Output file has wrong checksum");
      break;
    case UpsError.WritePastEof:
      console.warn("Attempted to write past end of output file");
      break;
  }
};

function readVUInt(buffer: Buffer, offset: number): [number, number] {
  let value = 0,
    shift = 0;

  while (true) {
    const octet = buffer.readUInt8(offset);
    offset += 1;
    if (octet & 0x80) {
      value += (octet & 0x7f) << shift;
      break;
    }
    value += (octet | 0x80) << shift;
    shift += 7;
  }

  return [value, offset];
}

export default class UpsPatch {
  _buffer: Buffer;

  constructor(buffer: Buffer) {
    this._buffer = buffer;
  }

  get validityScore() {
    return this.magic === "UPS1" ? 1 : 0;
  }

  get magic() {
    return this._buffer.toString("ascii", 0, 4);
  }

  get fileSizes() {
    let inputSize, outputSize;
    let offset;
    [inputSize, offset] = readVUInt(this._buffer, 0x04);
    [outputSize, offset] = readVUInt(this._buffer, offset);

    return [inputSize, outputSize, offset];
  }

  get patchSize() {
    return this._buffer.length;
  }
  get inputSize() {
    const [inputSize, ,] = this.fileSizes;
    return inputSize;
  }
  get outputSize() {
    const [, outputSize] = this.fileSizes;
    return outputSize;
  }

  get inputChecksum(): number {
    return this._buffer.readUInt32LE(this._buffer.length - 12);
  }
  get outputChecksum(): number {
    return this._buffer.readUInt32LE(this._buffer.length - 8);
  }
  get patchChecksum(): number {
    return this._buffer.readUInt32LE(this._buffer.length - 4);
  }
  get patchChecksumCalc(): number {
    return crc32(this._buffer.subarray(0, this._buffer.length - 4));
  }

  *getChunks(): Iterable<Chunk> {
    let [, , readOffset] = this.fileSizes;
    const patchEnd = this._buffer.length - 12;
    let writeOffset = 0;

    while (readOffset < patchEnd) {
      let diffOffset;
      [diffOffset, readOffset] = readVUInt(this._buffer, readOffset);
      const lengthMax = patchEnd - readOffset;
      writeOffset += diffOffset;

      for (let i = 0; i < lengthMax; i++) {
        if (this._buffer.readUInt8(readOffset + i) === 0x00) {
          const length = i;
          yield {
            offset: writeOffset,
            length: length,
            buffer: this._buffer.subarray(readOffset, readOffset + length),
          };
          readOffset += length + 1;
          writeOffset += length + 1;
          break;
        }
      }
    }
  }

  get chunks() {
    return Array.from(this.getChunks());
  }

  get nChunks() {
    return this.chunks.length;
  }

  get info() {
    return {
      nChunks: this.nChunks,

      patchSize: this.patchSize,
      patchChecksum: this.patchChecksum,
      patchChecksumCalc: this.patchChecksumCalc,

      inputSize: this.inputSize,
      inputChecksum: this.inputChecksum,

      outputSize: this.outputSize,
      outputChecksum: this.outputChecksum,
    };
  }

  applyTo(buffer: Buffer, errFunc: UpsErrorHandler = upsErrHandler): Buffer {
    let resBuffer = buffer;
    const end = this.outputSize;

    if (this.patchChecksum !== this.patchChecksumCalc) {
      if (errFunc(UpsError.InvalidPatchChecksum)) return resBuffer;
    }

    if (this.inputSize !== buffer.length) {
      if (errFunc(UpsError.InvalidInputSize)) return resBuffer;
    }

    const inputChecksumCalc = crc32(buffer);
    if (this.inputChecksum !== inputChecksumCalc) {
      if (errFunc(UpsError.InvalidInputChecksum)) return resBuffer;
    }

    if (end !== buffer.length) {
      resBuffer = Buffer.alloc(end);
      buffer.copy(resBuffer);
    }

    for (const chunk of this.chunks) {
      for (let i = 0; i < chunk.length; i++) {
        const writeOffset = chunk.offset + i;
        if (writeOffset >= end) {
          if (errFunc(UpsError.WritePastEof)) return resBuffer;
          break;
        }
        const inByte = resBuffer.readUInt8(writeOffset);
        const xorByte = chunk.buffer.readUInt8(i);
        resBuffer.writeUInt8(inByte ^ xorByte, writeOffset);
      }
    }

    const outputChecksumCalc = crc32(resBuffer);
    if (this.outputChecksum !== outputChecksumCalc) {
      if (errFunc(UpsError.InvalidOutputChecksum)) return resBuffer;
    }

    return resBuffer;
  }
}
