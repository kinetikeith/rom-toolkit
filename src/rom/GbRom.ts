import { Buffer } from "buffer";

import { trimNull, padNull, keysAsHex, mod, range } from "./utils";

import licenseesOld from "./data/gbLicenseesOld.json";
import licenseesNew from "./data/gbLicenseesNew.json";
import ramBanks from "./data/gbRamBanks.json";
import destinations from "./data/gbDestinations.json";
import features from "./data/gbFeatures.json";

interface MemoryInfo {
  banks: number;
  size: number;
}

const licenseeMapOld = keysAsHex(licenseesOld);
const licenseeMapNew = new Map<string, string>();
const romMap = new Map<number, MemoryInfo>(
  range(9).map((i) => [i, { banks: 2 << i, size: 32768 }])
);

const ramMap = new Map<number, MemoryInfo>();
const destinationMap = keysAsHex(destinations);
const featureMap = keysAsHex(features);

for (const [key, value] of Object.entries(licenseesNew)) {
  licenseeMapNew.set(key, value);
}

for (const [key, value] of Object.entries(ramBanks)) {
  ramMap.set(Number.parseInt(key, 16), {
    banks: value,
    size: 8192 * value,
  });
}

const logoBufferValid = Buffer.from(
  "CEED6666CC0D000B03730083000C000D" +
    "0008111F8889000EDCCC6EE6DDDDD999" +
    "BBBB67636E0EECCCDDDC999FBBB9333E",
  "hex"
);

const logoBufferClear = Buffer.alloc(48);

function iMask(x: number, y: number): [number, number] {
  const xWrapped = x % 48;
  const yWrapped = y % 8;
  const byteI =
    ((xWrapped & 0b0111100) >>> 1) +
    ((yWrapped & 0b00000010) >>> 1) +
    (yWrapped & 0b00000100) * 6;

  const bitI = (x & 0b011) + ((y & 0b001) << 2);
  const mask = 128 >>> bitI;

  return [byteI, mask];
}

export {
  licenseeMapOld,
  licenseeMapNew,
  romMap,
  ramMap,
  destinationMap,
  featureMap,
};

export class Logo {
  readonly _buffer: Buffer;
  constructor(buffer: Buffer) {
    this._buffer = buffer;
  }

  get isValid() {
    return this._buffer.equals(logoBufferValid);
  }

  get pixelArray(): Array<boolean> {
    let pixelArray = Array<boolean>(384).fill(false);
    this.eachPixel((x, y, value) => {
      pixelArray[x + y * 48] = value;
    });

    return pixelArray;
  }

  eachPixel(func: (x: number, y: number, value: boolean) => any) {
    let byteI = 0;
    for (const byte of this._buffer.values()) {
      const globalX = ((byteI >> 1) % 12) * 4;
      const globalY = ((byteI & 0b001) << 1) + ((byteI / 24) << 2);

      for (let bitI = 0; bitI < 8; bitI++) {
        const localX = bitI & 0b011;
        const localY = bitI >> 2;

        const x = globalX + localX;
        const y = globalY + localY;

        const mask = 128 >> bitI;
        func(x, y, (byte & mask) !== 0);
      }

      // Update enumerator
      byteI++;
    }
  }

  setPixel(x: number, y: number, value: boolean) {
    const [byteI, mask] = iMask(x, y);
    let byte = this._buffer.readUInt8(byteI);
    byte = value ? (byte |= mask) : (byte &= ~mask);
    this._buffer.writeUInt8(byte);
  }

  togglePixel(x: number, y: number) {
    const [byteI, mask] = iMask(x, y);
    let byte = this._buffer.readUInt8(byteI);
    byte ^= mask;
    this._buffer.writeUInt8(byte, byteI);
  }

  invert() {
    let byteI = 0;
    for (const byte of this._buffer.values()) {
      this._buffer.writeUInt8(byte ^ 0xff, byteI);
      byteI++;
    }
  }

  makeClear() {
    logoBufferClear.copy(this._buffer);
  }

  makeValid() {
    logoBufferValid.copy(this._buffer);
  }

  get ascii() {
    let lines = Array.from(Array(8), () => " ".repeat(48));

    this.eachPixel((x, y, value) => {
      if (value) {
        const line = lines[y];
        lines[y] = line.substring(0, x) + "@" + line.substring(x + 1, 48);
      }
    });
    return lines.join("\n");
  }

  copy() {
    return new Logo(Buffer.from(this._buffer));
  }
}

/* Implemented from specification found at
 * https://gbdev.io/pandocs/The_Cartridge_Header.html
 */
class Header {
  _buffer: Buffer;
  constructor(buffer: Buffer) {
    this._buffer = buffer;
  }

  get validity(): number {
    let score = 0;
    if (this._buffer.length < 0x050) return -1;
    if (this.headerChecksum === this.headerChecksumCalc) score += 4;
    if (this.logo.isValid) score += 4;

    return score;
  }

  get _logoBuffer() {
    return this._buffer.subarray(0x04, 0x34);
  }
  get logo(): Logo {
    return new Logo(this._logoBuffer);
  }
  set logo(logo: Logo) {
    logo._buffer.copy(this._logoBuffer);
  }

  get _titleMinBuffer() {
    return this._buffer.subarray(0x34, 0x3f);
  }
  get titleMin(): string {
    return trimNull(this._titleMinBuffer.toString("ascii"));
  }
  set titleMin(title: string) {
    this._titleMinBuffer.write(padNull(title, 11), "ascii");
  }

  get _titleBuffer() {
    return this._buffer.subarray(0x34, 0x43);
  }
  get title(): string {
    return trimNull(this._titleBuffer.toString("ascii"));
  }
  set title(title: string) {
    this._titleBuffer.write(padNull(title, 15), "ascii");
  }

  get _titleMaxBuffer() {
    return this._buffer.subarray(0x34, 0x44);
  }
  get titleMax(): string {
    return trimNull(this._titleMaxBuffer.toString("ascii"));
  }
  set titleMax(title: string) {
    this._titleMaxBuffer.write(padNull(title, 16), "ascii");
  }

  get version(): number {
    return this._buffer.readUInt8(0x4c);
  }
  set version(value: number) {
    this._buffer.writeUInt8(value, 0x4c);
  }

  get cgbFlag(): number {
    return this._buffer.readUInt8(0x43);
  }
  set cgbFlag(value: number) {
    this._buffer.writeUInt8(value, 0x43);
  }

  get sgbFlag(): number {
    return this._buffer.readUInt8(0x46);
  }
  set sgbFlag(value: number) {
    this._buffer.writeUInt8(value, 0x46);
  }

  get cartridgeCode(): number {
    return this._buffer.readUInt8(0x47);
  }
  set cartridgeCode(value: number) {
    this._buffer.writeUInt8(value, 0x47);
  }

  get romCode(): number {
    return this._buffer.readUInt8(0x48);
  }
  set romCode(value: number) {
    this._buffer.writeUInt8(value, 0x48);
  }
  get romSize(): number | undefined {
    return 32 * 1024 * (1 << this.romCode);
  }
  get romBanks(): number | undefined {
    return 2 * (1 << this.romCode);
  }

  get ramCode(): number {
    return this._buffer.readUInt8(0x49);
  }
  set ramCode(value: number) {
    this._buffer.writeUInt8(value, 0x49);
  }
  get ramSize(): number | undefined {
    return ramMap.get(this.ramCode)?.size;
  }
  get ramBanks(): number | undefined {
    return ramMap.get(this.ramCode)?.banks;
  }

  get licensee(): string | undefined {
    if (this.licenseeCodeOld === 0x33) {
      return licenseeMapNew.get(this.licenseeCodeNew);
    } else {
      return licenseeMapOld.get(this.licenseeCodeOld);
    }
  }

  get isLicenseeCodeNew(): boolean {
    return this.licenseeCodeOld === 0x33;
  }

  get licenseeCodeNew(): string {
    return this._buffer.toString("ascii", 0x44, 0x46);
  }
  set licenseeCodeNew(value: string) {
    this._buffer.write(padNull(value, 2), 0x44, 2, "ascii");
  }

  get licenseeCodeOld(): number {
    return this._buffer.readUInt8(0x4b);
  }
  set licenseeCodeOld(value: number) {
    this._buffer.writeUInt8(value, 0x4b);
  }

  get manufacturerCode(): string {
    return trimNull(this._buffer.toString("ascii", 0x3f, 0x43));
  }
  set manufacturerCode(value: string) {
    this._buffer.write(padNull(value, 4), 0x3f, 4, "ascii");
  }

  get destinationCode(): number {
    return this._buffer.readUInt8(0x4a);
  }
  set destinationCode(value: number) {
    this._buffer.writeUInt8(value, 0x4a);
  }

  get destination(): string | undefined {
    return destinationMap.get(this.destinationCode);
  }

  get headerChecksum(): number {
    return this._buffer.readUInt8(0x4d);
  }
  set headerChecksum(value: number) {
    this._buffer.writeUInt8(value, 0x4d);
  }

  get globalChecksum(): number {
    return this._buffer.readUInt16BE(0x4e);
  }

  get headerChecksumCalc(): number {
    const checkBuffer = this._buffer.subarray(0x34, 0x4d);
    let checksum = 0x00;

    for (const byte of checkBuffer.values()) {
      checksum = mod(checksum - byte - 1, 256);
    }

    return checksum;
  }
}

export default class Rom {
  readonly _buffer: Buffer;

  constructor(buffer: Buffer) {
    this._buffer = buffer;
  }

  static fromBuffer(buffer: Buffer) {
    return new Rom(buffer);
  }

  get header(): Header {
    return new Header(this._buffer.subarray(0x0100, 0x0150));
  }

  get validity(): number {
    return this.header.validity;
  }
}
