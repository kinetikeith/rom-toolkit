import { Buffer } from "buffer";
import { sortBy } from "lodash";

import { mod } from "./utils";

import chrSizes from "./data/nesChrSizes.json";
import prgSizes from "./data/nesPrgSizes.json";

const iNesMagic = "NES\x1a";

export enum Format {
  Raw,
  INes,
  INes2,
}

export enum Encoding {
  Invalid = -1,
  None,
  Ascii,
  JisX,
}

export enum Mirroring {
  None = -1,
  Horizontal,
  Vertical,
}

export enum ChrType {
  Rom,
  Ram,
}

const chrSizeMap = new Map<number, number[]>();
const prgSizeMap = new Map<number, number>();

for (const [key, value] of Object.entries(chrSizes)) {
  chrSizeMap.set(
    Number.parseInt(key, 16),
    value.map((size) => size * 1024)
  );
}

for (const [key, value] of Object.entries(prgSizes)) {
  prgSizeMap.set(Number.parseInt(key, 16), value * 1024);
}

export { chrSizeMap, prgSizeMap };

const asciiRegex = /[\x20-\x3f\x41-\x5a]+/;
const jisXRegex = /[\x20-\x7e\xa1-\df]+/;

function checkForINesHeader(buffer: Buffer): boolean {
  const header = new INesHeader(buffer.subarray(0, 16));
  return header.validity > 0;
}

function findLicenseHeaderOffset(buffer: Buffer): number {
  /* Score the header by creating several test instances and finding the validity
   * of each */
  let liPoss = [];

  for (let liEnd = 0xfffa; liEnd < buffer.length; liEnd += 0x10000) {
    const liStart = liEnd - 0x1a;
    const headerBuffer = buffer.subarray(liStart, liEnd);
    const header = new LicenseHeader(headerBuffer);
    liPoss.push({ offset: liStart, header: header });
  }

  const liBest = sortBy(liPoss, (poss) => poss.header.validity).pop()?.offset;

  return liBest === undefined ? -1 : liBest;
}

/* Implemented from specification found at
 * https://www.nesdev.org/wiki/INES
 * https://www.nesdev.org/wiki/NES_2.0
 */
class INesHeader {
  _buffer: Buffer;

  constructor(buffer: Buffer) {
    this._buffer = buffer;
  }

  get validity(): number {
    let score = 0;

    if (this.magic === iNesMagic) score += 4;

    return score;
  }

  get magic(): string {
    return this._buffer.toString("ascii", 0, 4);
  }

  get format(): Format {
    return Format.INes;
  }
}

/* Implemented from specifications found at
 * https://www.nesdev.org/wiki/Nintendo_header
 */
class LicenseHeader {
  _buffer: Buffer;

  constructor(buffer: Buffer) {
    this._buffer = buffer;
  }

  get validity(): number {
    let score = 0;

    /* Check if the title parameters are accurate */
    const titleLength = this.titleLength;
    if (this.titleEncoding === Encoding.None) {
      if (this.titleLength === 0) score += 1;
    } else if (this.titleEncoding === Encoding.Ascii) {
      const matchLen = this.title.match(asciiRegex)?.[0]?.length;
      if (matchLen === titleLength) score += 3;
      else if (matchLen === titleLength - 1) score += 2;
    } else if (this.titleEncoding === Encoding.JisX) {
      const matchLen = this.title.match(jisXRegex)?.[0]?.length;
      if (matchLen === titleLength) score += 3;
      else if (matchLen === titleLength - 1) score += 2;
    }

    /* Check that CHR checksum is blank if CHR type is RAM */
    if (this.chrType === ChrType.Ram) {
      if (this.chrChecksum === 0) score += 1;
      else score -= 1;
    }

    /* Verify the checksum */
    if (this.headerChecksumCalc === 0) {
      score += 1;
      /* If complement is non-zero and correct, likelihood greater */
      if (this.headerComplement !== 0) score += 3;
    } else score -= 4;

    return score;
  }

  get title(): string {
    // TODO: Trim padding from beginning of title
    return this._buffer.toString("ascii", 0x00, 0x10);
  }
  set title(value: string) {
    // TODO: Ensure that space padding is correct treatment of title
    const trimmed = value.slice(0, 16);
    const length = trimmed.length;
    const padded = trimmed.padStart(16, " ");
    this._buffer.write(padded, 0x00, 16, "ascii");
    this._buffer.writeUInt8(Math.max(0, length - 1), 0x17);
  }

  get prgChecksum(): number {
    return this._buffer.readUInt16BE(0x10);
  }
  set prgChecksum(value: number) {
    this._buffer.writeUInt16BE(value, 0x10);
  }

  get chrChecksum(): number {
    return this._buffer.readUInt16BE(0x12);
  }
  set chrChecksum(value: number) {
    this._buffer.writeUInt16BE(value, 0x12);
  }

  get chrCode(): number {
    return this._buffer.readUInt8(0x14) & 0b0111;
  }
  set chrCode(value: number) {
    const prev = this._buffer.readUInt8(0x14);
    const bits = value & 0b00000111;
    const otherMask = 0b11111000;
    this._buffer.writeUInt8(bits | (prev & otherMask), 0x14);
  }

  get chrType(): ChrType {
    const value = (this._buffer.readUInt8(0x14) & 0b1000) >> 3;

    if (value) return ChrType.Rom;
    else return ChrType.Ram;
  }
  set chrType(value: ChrType) {
    const prev = this._buffer.readUInt8(0x14);
    const bit = value === ChrType.Rom ? 0b1000 : 0b0000;
    const otherMask = 0b11110111;
    this._buffer.writeUInt8(bit | (prev & otherMask), 0x14);
  }

  get prgCode(): number {
    return (this._buffer.readUInt8(0x14) & 0b11110000) >> 4;
  }
  set prgCode(value: number) {
    const prev = this._buffer.readUInt8(0x14);
    const bits = (value << 4) & 0b11110000;
    const otherMask = 0b00001111;
    this._buffer.writeUInt8(bits | (prev & otherMask), 0x14);
  }

  get prgSize(): number | undefined {
    return prgSizeMap.get(this.prgCode);
  }

  get mapperCode(): number {
    return this._buffer.readUInt8(0x15) & 0b01111111;
  }
  set mapperCode(value: number) {
    const bits = value & 0b01111111;
    const prev = this._buffer.readUInt8(0x15);
    const otherMask = 0b10000000;
    this._buffer.writeUInt8(bits | (prev & otherMask), 0x15);
  }

  get mirroring(): Mirroring {
    const value = (this._buffer.readUInt8(0x15) & 0b10000000) >> 7;

    if (value) return Mirroring.Horizontal;
    else return Mirroring.Vertical;
  }
  set mirroring(value: Mirroring) {
    const bit = value === Mirroring.Horizontal ? 0b10000000 : 0b00000000;
    const prev = this._buffer.readUInt8(0x15);
    const otherMask = 0b01111111;
    this._buffer.writeUInt8(bit | (prev & otherMask), 0x15);
  }

  get titleEncoding(): Encoding {
    const value = this._buffer.readUInt8(0x16);
    if (value === 0) return Encoding.None;
    else if (value === 1) return Encoding.Ascii;
    else if (value === 2) return Encoding.JisX;

    return Encoding.Invalid;
  }

  get titleLength(): number {
    const value = this._buffer.readUInt8(0x17);

    return value > 0 ? value + 1 : 0;
  }

  get licenseeCode(): number {
    return (this._buffer.readUInt8(0x18) & 0b10000000) >> 7;
  }

  get headerComplement(): number {
    return this._buffer.readUInt8(0x19);
  }
  set headerComplement(value: number) {
    this._buffer.writeUInt8(value, 0x19);
  }

  get headerComplementCalc(): number {
    let checksum = 0x00;
    const checkBuffer = this._buffer.subarray(0x12, 0x19);

    for (const byte of checkBuffer.values()) {
      checksum = mod(checksum + byte, 256);
    }

    return mod(256 - checksum, 256);
  }

  get headerChecksumCalc(): number {
    let checksum = 0x00;
    const checkBuffer = this._buffer.subarray(0x12, 0x1a);

    for (const byte of checkBuffer.values()) {
      checksum = mod(checksum + byte, 256);
    }

    return checksum;
  }
}

export default class NesRom {
  readonly _buffer: Buffer;
  readonly licenseHeaderOffset: number;
  readonly hasINesHeader: boolean;

  constructor(
    buffer: Buffer,
    hasINesHeader: boolean,
    licenseHeaderOffset: number
  ) {
    this._buffer = buffer;
    this.hasINesHeader = hasINesHeader;
    this.licenseHeaderOffset = licenseHeaderOffset;
  }

  static fromBuffer(buffer: Buffer): NesRom {
    const hasINesHeader = checkForINesHeader(buffer);
    const rawBuffer = hasINesHeader ? buffer.subarray(16) : buffer;
    const licenseHeaderOffset = findLicenseHeaderOffset(rawBuffer);

    return new NesRom(buffer, hasINesHeader, licenseHeaderOffset);
  }

  get validity(): number {
    let score = 0;
    const licenseHeader = this.licenseHeader;
    const iNesHeader = this.iNesHeader;

    if (licenseHeader) score += licenseHeader.validity;
    if (iNesHeader) score += iNesHeader.validity;

    return score;
  }

  get licenseHeader(): LicenseHeader | null {
    const offset = this.licenseHeaderOffset;
    if (offset > -1) {
      const buffer = this.rawBuffer.subarray(offset, offset + 26);
      return new LicenseHeader(buffer);
    } else return null;
  }

  get iNesHeader(): INesHeader | null {
    if (this.hasINesHeader) {
      const buffer = this._buffer.subarray(0, 16);
      return new INesHeader(buffer);
    } else return null;
  }

  get rawBuffer(): Buffer {
    if (this.hasINesHeader) return this._buffer.subarray(16);
    else return this._buffer.subarray();
  }

  get format(): Format {
    return this.iNesHeader?.format || Format.Raw;
  }
}
