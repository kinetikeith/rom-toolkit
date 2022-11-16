import { Buffer } from "buffer";

interface Chunk {
  offset: number;
  length: number;
  buffer: () => Buffer;
}

export default class IpsPatch {
  _buffer: Buffer;

  constructor(buffer: Buffer) {
    this._buffer = buffer;
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
    return this.getChunks();
  }

  applyTo(buffer: Buffer): Buffer {
    let resBuffer = buffer;
    const chunks = [...this.getChunks()];
    chunks.sort((chunk) => chunk.offset);
    const lastChunk = chunks[chunks.length - 1];
    const patchLength = lastChunk.offset + lastChunk.length;

    if (patchLength > buffer.length) {
      resBuffer = Buffer.alloc(patchLength);
      buffer.copy(resBuffer);
    }

    for (const chunk of chunks) {
      chunk.buffer().copy(resBuffer, chunk.offset);
    }

    return resBuffer;
  }
}
