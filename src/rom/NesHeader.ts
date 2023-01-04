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

function findHeader(buffer: Buffer): NesHeader {
  /* Score the header by creating several test instances and finding the validity
   * of each */
  const baseHeader = new NesHeader(buffer);
  const dataBuffer = baseHeader._dataBuffer;

  let liPoss = [];

  for (let liEnd = 0xfffa; liEnd < dataBuffer.length; liEnd += 0x10000) {
    const liStart = liEnd - 0x1a;
    const testHeader = new NesHeader(buffer, liStart);
    liPoss.push({ loc: liStart, score: testHeader.validity });
  }

  const liBestLoc = sortBy(liPoss, (poss) => poss.score).pop()?.loc;

  return new NesHeader(buffer, liBestLoc);
}

/* Implemented from specifications found at
 * https://www.nesdev.org/wiki/Nintendo_header
 * https://www.nesdev.org/wiki/INES
 * https://www.nesdev.org/wiki/NES_2.0
 */
export default class NesHeader {
  _buffer: Buffer;
  readonly licenseLoc: number;

  constructor(buffer: Buffer, licenseLoc?: number | undefined) {
    this._buffer = buffer;
    this.licenseLoc = licenseLoc || 0x00;
  }

  static fromRom(buffer: Buffer): NesHeader {
    return findHeader(buffer);
  }

  get validity(): number {
    let score = 0;
    /* Check if additional format info is present */
    if (this.format === Format.INes) score += 3;
    else if (this.format === Format.INes2) score += 3;

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

  get format(): Format {
    // Check for iNES/NES 2.0 magic value "NES<EOF>"
    if (this._buffer.toString("ascii", 0x00, 0x04) === iNesMagic) {
      // Check if bits 3 and 4 of byte 7 equal 0 and 1, respectively
      const byte = this._buffer.readUInt8(0x07);
      if ((byte & 0b1100) === 0b1000) return Format.INes2;
      else return Format.INes;
    }

    return Format.Raw;
  }

  get _dataBuffer(): Buffer {
    if (this.format === Format.INes) return this._buffer.subarray(0x10);
    else if (this.format === Format.INes2) return this._buffer.subarray(0x10);

    return this._buffer;
  }

  get _licenseBuffer(): Buffer {
    return this._dataBuffer.subarray(this.licenseLoc, this.licenseLoc + 0x1a);
  }

  get title(): string {
    // TODO: Trim padding from beginning of title
    return this._licenseBuffer.toString("ascii", 0x00, 0x10);
  }
  set title(value: string) {
    // TODO: Ensure that space padding is correct treatment of title
    const trimmed = value.slice(0, 16);
    const length = trimmed.length;
    const padded = trimmed.padStart(16, " ");
    this._licenseBuffer.write(padded, 0x00, 16, "ascii");
    this._licenseBuffer.writeUInt8(Math.max(0, length - 1), 0x17);
  }

  get prgChecksum(): number {
    return this._licenseBuffer.readUInt16BE(0x10);
  }

  get chrChecksum(): number {
    return this._licenseBuffer.readUInt16BE(0x12);
  }

  get chrCode(): number {
    return this._licenseBuffer.readUInt8(0x14) & 0b0111;
  }
  set chrCode(value: number) {
    const prev = this._licenseBuffer.readUInt8(0x14);
    const bits = value & 0b00000111;
    const otherMask = 0b11111000;
    this._licenseBuffer.writeUInt8(bits | (prev & otherMask), 0x14);
  }
  get chrSize(): number[] | undefined {
    return chrSizeMap.get(this.chrCode);
  }

  get chrType(): ChrType {
    const value = (this._licenseBuffer.readUInt8(0x14) & 0b1000) >> 3;

    if (value) return ChrType.Rom;
    else return ChrType.Ram;
  }
  set chrType(value: ChrType) {
    const prev = this._licenseBuffer.readUInt8(0x14);
    const bit = value === ChrType.Rom ? 0b1000 : 0b0000;
    const otherMask = 0b111101111;
    this._licenseBuffer.writeUInt8(bit | (prev & otherMask), 0x14);
  }

  get prgCode(): number {
    return (this._licenseBuffer.readUInt8(0x14) & 0b11110000) >> 4;
  }
  set prgCode(value: number) {
    const prev = this._licenseBuffer.readUInt8(0x14);
    const bits = (value << 4) & 0b11110000;
    const otherMask = 0b00001111;
    this._licenseBuffer.writeUInt8(bits | (prev & otherMask), 0x14);
  }

  get prgSize(): number | undefined {
    return prgSizeMap.get(this.prgCode);
  }

  get mapperCode(): number {
    return this._licenseBuffer.readUInt8(0x15) & 0b01111111;
  }

  get mirroring(): Mirroring {
    const value = (this._licenseBuffer.readUInt8(0x15) & 0b10000000) >> 7;

    if (value) return Mirroring.Horizontal;
    else return Mirroring.Vertical;
  }

  get titleEncoding(): Encoding {
    const value = this._licenseBuffer.readUInt8(0x16);
    if (value === 0) return Encoding.None;
    else if (value === 1) return Encoding.Ascii;
    else if (value === 2) return Encoding.JisX;

    return Encoding.Invalid;
  }

  get titleLength(): number {
    const value = this._licenseBuffer.readUInt8(0x17);

    return value > 0 ? value + 1 : 0;
  }

  get licenseeCode(): number {
    return (this._licenseBuffer.readUInt8(0x18) & 0b10000000) >> 7;
  }

  get headerComplement(): number {
    return this._licenseBuffer.readUInt8(0x19);
  }

  get headerChecksumCalc(): number {
    let checksum = 0x00;
    const checkBuffer = this._licenseBuffer.subarray(0x12, 0x1a);

    for (const byte of checkBuffer.values()) {
      checksum = mod(checksum + byte, 256);
    }

    return checksum;
  }
}
