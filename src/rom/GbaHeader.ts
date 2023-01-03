import { Buffer } from "buffer";

import { trimNull, padNull, mod } from "./utils";

import destinations from "./data/gbaDestinations.json";

const destinationMap = new Map<string, string>([
  ...Object.entries(destinations),
]);

export { destinationMap };

class GbaLogo {
  _buffer: Buffer;
  constructor(buffer: Buffer) {
    this._buffer = buffer;
  }
}

/* Implemented from specification found at
 * https://problemkaputt.de/gbatek.htm#gbacartridges
 */
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
    if (this._buffer.length < 0xc0) return -1;
    if (this._buffer.readUInt8(0xb2) === 0x96) score += 2;
    if (this._buffer.readUInt16BE(0xbe) === 0x0000) score += 2;

    const title = this.title;
    const titleMatch = title.match(/\w+/);
    if (titleMatch?.[0] === title) {
      score += 2;
    } else score -= 1;

    const gameCode = this.gameCode;
    const gameCodeMatch = gameCode.match(/\w+/);
    if (gameCodeMatch?.[0] === gameCode) {
      score += 2;
    } else score -= 1;

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

  get hardwareCode(): string {
    return this._buffer.toString("ascii", 0xac, 0xad);
  }
  set hardwareCode(value: string) {
    this._buffer.write(value, 0xac, 1, "ascii");
  }

  get titleCode(): string {
    return this._buffer.toString("ascii", 0xad, 0xaf);
  }
  set titleCode(value: string) {
    this._buffer.write(padNull(value, 2), 0xad, 2, "ascii");
  }

  get destinationCode(): string {
    return this._buffer.toString("ascii", 0xaf, 0xb0);
  }
  set destinationCode(value: string) {
    this._buffer.write(value, 0xaf, 1, "ascii");
  }

  get makerCode(): string {
    return this._buffer.toString("ascii", 0xb0, 0xb2);
  }
  set makerCode(value: string) {
    this._buffer.write(padNull(value, 2), 0xb0, 2, "ascii");
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

  get headerChecksumCalc(): number {
    const checkBuffer = this._buffer.subarray(0xa0, 0xbd);
    let checksum = 0x00;
    for (const byte of checkBuffer.values()) {
      checksum = mod(checksum - byte, 256);
    }

    return mod(checksum - 0x19, 256);
  }
}
