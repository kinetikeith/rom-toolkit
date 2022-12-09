import { Buffer } from "buffer";

import { trimNull, padNull } from "./utils";

class GbaLogo {
  _buffer: Buffer;
  constructor(buffer: Buffer) {
    this._buffer = buffer;
  }
}

export default class GbaHeader {
  _buffer: Buffer;
  constructor(buffer: Buffer) {
    this._buffer = buffer;
  }

  static fromRom(buffer: Buffer) {
    return new GbaHeader(buffer.subarray(0x00, 0xc0));
  }

  get validity() {
    let score = 0;
    if (this._buffer.readUInt16BE(0xbe) === 0x0000) score += 2;

    return score;
  }

  get _logoBuffer() {
    return this._buffer.subarray(0x04, 0xa0);
  }

  get logo(): GbaLogo {
    return new GbaLogo(this._logoBuffer);
  }
  set logo(logo: GbaLogo) {
    logo._buffer.copy(this._logoBuffer);
  }

  get title(): string {
    return trimNull(this._buffer.toString("ascii", 0xa0, 0xac));
  }
  set title(value: string) {
    this._buffer.write(padNull(value, 12), 0xa0, 12, "ascii");
  }

  get gameCode(): string {
    return this._buffer.toString("ascii", 0xac, 0xb0);
  }
  set gameCode(value: string) {
    this._buffer.write(padNull(value, 4), 0xac, 4, "ascii");
  }

  get makerCode(): string {
    return this._buffer.toString("ascii", 0xb0, 0xb2);
  }
  set makerCode(value: string) {
    this._buffer.write(padNull(value, 2), 0xac, 2, "ascii");
  }

  get unitCode(): number {
    return this._buffer.readUInt8(0xb3);
  }
  set unitCode(value: number) {
    this._buffer.writeUInt8(value, 0xb3);
  }

  get deviceCode(): number {
    return this._buffer.readUInt8(0xb4);
  }
  set deviceCode(value: number) {
    this._buffer.writeUInt8(value, 0xb4);
  }

  get version(): number {
    return this._buffer.readUInt8(0xbc);
  }
  set version(value: number) {
    this._buffer.writeUInt8(value, 0xbc);
  }

  get headerChecksum(): number {
    return this._buffer.readUInt8(0xbd);
  }
  set headerChecksum(value: number) {
    this._buffer.writeUInt8(value, 0xbd);
  }
}
