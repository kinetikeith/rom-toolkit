import { Buffer } from "buffer";

interface Chunk {
  offset: number;
  length: number;
  buffer: Buffer;
}

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
  readonly fileName: string;

  constructor(buffer: Buffer, fileName: string = "") {
    this._buffer = buffer;
    this.fileName = fileName;
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

  get inputSize() {
    const [inputSize, ,] = this.fileSizes;
    return inputSize;
  }

  get outputSize() {
    const [, outputSize] = this.fileSizes;
    return outputSize;
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

  applyTo(buffer: Buffer): Buffer {
    let resBuffer = buffer;
    let end = this.outputSize;

    if (end > buffer.length) {
      resBuffer = Buffer.alloc(end);
      buffer.copy(resBuffer);
    }

    for (const chunk of this.chunks) {
      for (let i = 0; i < chunk.length; i++) {
        const writeOffset = chunk.offset + i;
        const inByte = resBuffer.readUInt8(writeOffset);
        const xorByte = chunk.buffer.readUInt8(i);
        resBuffer.writeUInt8(inByte ^ xorByte, writeOffset);
      }
    }

    return resBuffer;
  }
}
