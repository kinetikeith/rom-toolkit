import { Buffer } from "buffer";
import { sortBy } from "lodash";

import { mod } from "./utils";

const iNesMagic = "NES\x1a";

export enum Format {
  Raw,
  INes,
  INes2,
}

enum Encoding {
  Invalid = -1,
  None,
  Ascii,
  JisX,
}

enum Mirroring {
  None = -1,
  Horizontal,
  Vertical,
}

enum ChrType {
  Rom,
  Ram,
}

const asciiRegex = /[\x20-\x3f\x41-\x5a]+/;
const jisXRegex = /[\x20-\x7e\xa1-\df]+/;

function findHeader(buffer: Buffer): NesHeader {
  /* Score the header by creating several test instances and finding the validity
   * of each */
  const baseHeader = new NesHeader(buffer);
  const dataBuffer = baseHeader._dataBuffer;

  let liPoss = [];

  for (let liEnd = 0xfffa; liEnd < dataBuffer.length; liEnd += 0x1000) {
    const liStart = liEnd - 0x1a;
    const testHeader = new NesHeader(buffer, liStart);
    liPoss.push({ loc: liStart, score: testHeader.validity });
  }

  const liBestLoc = sortBy(liPoss, (poss) => poss.score).pop()?.loc;

  return new NesHeader(buffer, liBestLoc);
}

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
    /* Check if the format is accurate */
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

    /* Verify the checksum */
    if (this.licenseChecksumCalc === 0) {
      score += 2;
      /* If complement is non-zero and correct, likelihood greater */
      if (this.licenseComplement !== 0) score += 2;
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
    return this._licenseBuffer.toString("ascii", 0x00, 0x10);
  }

  get prgChecksum(): number {
    return this._licenseBuffer.readUInt16BE(0x10);
  }

  get chrChecksum(): number {
    return this._licenseBuffer.readUInt16BE(0x12);
  }

  get chrCode(): number {
    return this._licenseBuffer.readUInt8(0x14) & 0b0011;
  }

  get chrType(): ChrType {
    const value = (this._licenseBuffer.readUInt8(0x14) & 0b0100) >> 2;

    if (value) return ChrType.Rom;
    else return ChrType.Ram;
  }

  get prgCode(): number {
    return (this._licenseBuffer.readUInt8(0x14) & 0b11111000) >> 3;
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
    else if (value === 2) return Encoding.Ascii;

    return Encoding.Invalid;
  }

  get titleLength(): number {
    const value = this._licenseBuffer.readUInt8(0x17);

    return value > 0 ? value + 1 : 0;
  }

  get licenseeCode(): number {
    return (this._licenseBuffer.readUInt8(0x18) & 0b10000000) >> 7;
  }

  get licenseComplement(): number {
    return this._licenseBuffer.readUInt8(0x19);
  }

  get licenseChecksumCalc(): number {
    let checksum = 0x00;
    const checkBuffer = this._licenseBuffer.subarray(0x12, 0x1a);

    for (const byte of checkBuffer.values()) {
      checksum = mod(checksum + byte, 256);
    }

    return checksum;
  }
}
