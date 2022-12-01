import { Buffer } from "buffer";
import { min, max } from "lodash";

interface Chunk {
  offset: number;
  length: number;
  buffer: () => Buffer;
}

export default class IpsPatch {
  _buffer: Buffer;
  readonly fileName: string;

  constructor(buffer: Buffer, fileName: string = "") {
    this._buffer = buffer;
    this.fileName = fileName;
  }

  get validityScore() {
    return this.magic === "PATCH" ? 1 : 0;
  }

  get magic() {
    return this._buffer.toString("ascii", 0, 5);
  }

  *getChunks(): Iterable<Chunk> {
    let patchIndex = 0x05;

    while (true) {
      const chunkOffset =
        (this._buffer.readUInt8(patchIndex) << 16) |
        (this._buffer.readUInt8(patchIndex + 0x01) << 8) |
        this._buffer.readUInt8(patchIndex + 0x02);
      if (chunkOffset === 0x454f46) return; // EOF encountered
      const chunkLength = this._buffer.readUInt16BE(patchIndex + 0x03);
      if (chunkLength === 0) {
        // chunkLength of 0 denotes a run of the same value (RLE)
        const runLength = this._buffer.readUInt16BE(patchIndex + 0x05);
        const runByte = this._buffer.readUInt8(patchIndex + 0x07);
        yield {
          offset: chunkOffset,
          length: runLength,
          buffer: () => Buffer.alloc(runLength, runByte),
        };

        patchIndex += 0x08;
      } else {
        // Otherwise, it's a normal chunk.
        const chunkIndex = patchIndex + 0x05;
        yield {
          offset: chunkOffset,
          length: chunkLength,
          buffer: () =>
            this._buffer.subarray(chunkIndex, chunkIndex + chunkLength),
        };

        patchIndex += chunkLength + 0x05;
      }
    }
  }

  get chunks() {
    return Array.from(this.getChunks());
  }

  get begin() {
    return min(this.chunks.map((chunk) => chunk.offset));
  }

  get end() {
    return max(this.chunks.map((chunk) => chunk.offset + chunk.length));
  }

  applyTo(buffer: Buffer): Buffer {
    let resBuffer = buffer;
    const chunks = this.chunks;
    const end = max(chunks.map((chunk) => chunk.offset + chunk.length)) || 0;

    if (end > buffer.length) {
      resBuffer = Buffer.alloc(end);
      buffer.copy(resBuffer);
    }

    for (const chunk of chunks) {
      chunk.buffer().copy(resBuffer, chunk.offset);
    }

    return resBuffer;
  }
}
