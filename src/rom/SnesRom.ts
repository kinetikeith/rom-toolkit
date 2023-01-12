import { Buffer } from "buffer";
import { sortBy } from "lodash";

import { trimNull, padNull, keysAsHex, range } from "./utils";

import destinations from "./data/snesDestinations.json";
import mappers from "./data/snesMappers.json";
import features from "./data/snesFeatures.json";

const destinationMap: Map<number, string> = keysAsHex<string>(destinations);
const mapperMap: Map<number, string> = keysAsHex<string>(mappers);
const featureMap: Map<number, string[]> = keysAsHex<string[]>(features);

const ramMap = new Map<number, number>(range(0x08).map((i) => [i, 1024 << i]));
const romMap = new Map<number, number>(
  range(0x05, 0x10).map((i) => [i, 1024 << i])
);

enum Feature {
  Gsu1 = -128,
  Gsu2,
  Gsu1Battery,
  Gsu2Battery,
  Cx4,
  Spc7110,
  St018,
  St010,
  Spc7110Rtc,
  Xband,
  Power,
}

featureMap.set(Feature.Gsu1, ["ROM", "RAM", "GSU-1"]);
featureMap.set(Feature.Gsu2, ["ROM", "RAM", "GSU-2"]);
featureMap.set(Feature.Gsu1Battery, ["ROM", "RAM", "Battery", "GSU-1"]);
featureMap.set(Feature.Gsu2Battery, ["ROM", "RAM", "Battery", "GSU-2"]);
featureMap.set(Feature.Cx4, ["ROM", "Cx4"]);
featureMap.set(Feature.Spc7110, ["ROM", "RAM", "Battery", "SPC7110"]);
featureMap.set(Feature.St018, ["ROM", "RAM", "Battery", "STC-018"]);
featureMap.set(Feature.St010, ["ROM", "Battery", "ST-010/011"]);
featureMap.set(Feature.Spc7110Rtc, ["ROM", "RAM", "Battery", "RTC", "SPC7110"]);
featureMap.set(Feature.Xband, ["ROM", "RAM", "Battery", "RC2324DPL"]);
featureMap.set(Feature.Power, ["ROM", "RAM", "Battery", "MX15001TFC"]);

type FeatureCode = Feature | number;

export { destinationMap, ramMap, romMap, mapperMap, featureMap };

function findHeaderOffset(buffer: Buffer): number {
  const offsets = [0xffb0, 0x7fb0, 0x40ffb0];

  const objs = offsets.map((offset) => {
    const headerBuffer = buffer.subarray(offset, offset + 48);
    return {
      offset: offset,
      header: new Header(headerBuffer),
    };
  });

  const best = sortBy(objs, (poss) => poss.header.validity).pop()?.offset;
  return best === undefined ? 0 : best;
}

/* Implemented from specification found at
 * https://sneslab.net/wiki/SNES_ROM_Header
 *
 * Please note: some of the information in the above article is bunk.
 */
class Header {
  _buffer: Buffer;

  constructor(buffer: Buffer) {
    this._buffer = buffer;
  }

  get validity(): number {
    let score = 0;
    if (this._buffer.length < 48) return -1;

    if (this._buffer.readUInt8(0x0c) === 0x00) score += 1;
    if (this._buffer.readUInt8(0x2a) === 0x33) score += 1;

    if (mapperMap.has(this.mapperCode)) score += 1;

    return score;
  }

  get makerCode(): string {
    return trimNull(this._buffer.toString("ascii", 0x00, 0x02));
  }
  set makerCode(value: string) {
    this._buffer.write(padNull(value, 4), 0x00, 2, "ascii");
  }

  get gameCode(): string {
    return trimNull(this._buffer.toString("ascii", 0x02, 0x06));
  }
  set gameCode(value: string) {
    this._buffer.write(padNull(value, 4), 0x02, 4, "ascii");
  }

  get ramExpansionCode(): number {
    return this._buffer.readUInt16LE(0x0d);
  }
  set ramExpansionCode(value: number) {
    this._buffer.writeUInt16LE(value, 0x0d);
  }
  get ramExpansionSize(): number {
    const ramExpansionCode = this.ramExpansionCode;
    return ramExpansionCode === 0x00 ? 0 : 1024 << ramExpansionCode;
  }

  get versionSpecial(): number {
    return this._buffer.readUInt8(0x0e);
  }

  get cartridgeSubCode(): number {
    return this._buffer.readUInt8(0x0f);
  }
  set cartridgeSubCode(value: number) {
    this._buffer.writeUInt8(value, 0x0f);
  }

  get title(): string {
    return this._buffer.toString("utf8", 0x10, 0x25).trimEnd();
  }
  set title(value: string) {
    this._buffer.write(value.padEnd(21, " "), 0x10, 21, "utf8");
  }

  get mapModeCode(): number {
    return this._buffer.readUInt8(0x25);
  }
  get mapperCode(): number {
    return this.mapModeCode & 0x0f;
  }
  set mapperCode(value: number) {
    const code = this.mapModeCode;
    this._buffer.writeUInt8((0xf0 & code) | (value & 0x0f), 0x25);
  }
  get mapper(): string | undefined {
    return mapperMap.get(this.mapperCode);
  }
  get isMapperFast(): number {
    return this.mapModeCode & 0x10;
  }

  get cartridgeCode(): number {
    return this._buffer.readUInt8(0x26);
  }
  set cartridgeCode(value: number) {
    this._buffer.writeUInt8(value, 0x26);
  }

  get featureCode(): FeatureCode {
    const code = this.cartridgeCode;
    const subCode = this.cartridgeSubCode;
    const gameCode = this.gameCode;
    const rom1mb = this.romCode < 0x0a;

    if (code === 0x14) return rom1mb ? Feature.Gsu1 : Feature.Gsu2;
    else if (code === 0x15)
      return rom1mb ? Feature.Gsu1Battery : Feature.Gsu2Battery;
    else if (code === 0xf3) {
      if (subCode === 0x10) return Feature.Cx4;
    } else if (code === 0xf5) {
      if (subCode === 0x00) return Feature.Spc7110;
      else if (subCode === 0x02) return Feature.St018;
    } else if (code === 0xf6) {
      if (subCode === 0x01) return Feature.St010;
    } else if (code === 0xf9) {
      if (subCode === 0x00) return Feature.Spc7110Rtc;
    } else if (gameCode === "XBND") return Feature.Xband;
    else if (gameCode === "MENU") return Feature.Power;

    return code;
  }
  set featureCode(value: FeatureCode) {
    switch (value) {
      case Feature.Gsu1:
      case Feature.Gsu2:
        this.cartridgeCode = 0x14;
        this.clearSpecialGameCode();
        break;
      case Feature.Gsu1Battery:
      case Feature.Gsu2Battery:
        this.cartridgeCode = 0x15;
        this.clearSpecialGameCode();
        break;
      case Feature.Cx4:
        this.cartridgeCode = 0xf3;
        this.cartridgeSubCode = 0x10;
        this.clearSpecialGameCode();
        break;
      case Feature.Spc7110:
        this.cartridgeCode = 0xf5;
        this.cartridgeSubCode = 0x00;
        this.clearSpecialGameCode();
        break;
      case Feature.St018:
        this.cartridgeCode = 0xf5;
        this.cartridgeSubCode = 0x02;
        this.clearSpecialGameCode();
        break;
      case Feature.St010:
        this.cartridgeCode = 0xf6;
        this.cartridgeSubCode = 0x01;
        this.clearSpecialGameCode();
        break;
      case Feature.Spc7110Rtc:
        this.cartridgeCode = 0xf9;
        this.cartridgeSubCode = 0x00;
        this.clearSpecialGameCode();
        break;
      case Feature.Xband:
        this.gameCode = "XBND";
        this.cartridgeCode = 0x02;
        this.cartridgeSubCode = 0x00;
        break;
      case Feature.Power:
        this.gameCode = "MENU";
        this.cartridgeCode = 0x02;
        this.cartridgeSubCode = 0x00;
        break;
    }
    if (value >= 0x00 && value <= 0xff) {
      this.cartridgeCode = value;
      this.clearSpecialGameCode();
    }
  }

  clearSpecialGameCode() {
    const code = this.gameCode;
    if (code === "XBND") this.gameCode = "";
    else if (code === "MENU") this.gameCode = "";
  }

  get romCode(): number {
    return this._buffer.readUInt8(0x27);
  }
  set romCode(value: number) {
    this._buffer.writeUInt8(value, 0x27);
  }
  get romSize(): number | undefined {
    return romMap.get(this.romCode);
  }

  get ramCode(): number {
    return this._buffer.readUInt8(0x28);
  }
  set ramCode(value: number) {
    this._buffer.writeUInt8(value, 0x28);
  }
  get ramSize(): number | undefined {
    return ramMap.get(this.ramCode);
  }

  get destinationCode(): number {
    return this._buffer.readUInt8(0x29);
  }
  set destinationCode(value: number) {
    this._buffer.writeUInt8(value, 0x29);
  }
  get destination(): string | undefined {
    return destinationMap.get(this.destinationCode);
  }

  get isNewFormat(): boolean {
    return this._buffer.readUInt8(0x2a) === 0x33;
  }

  get version(): number {
    return this._buffer.readUInt8(0x2b);
  }
  set version(value: number) {
    this._buffer.writeUInt8(value, 0x2b);
  }

  get globalChecksum(): number {
    return this._buffer.readUInt16LE(0x2c);
  }
  get globalComplement(): number {
    return this._buffer.readUInt16LE(0x2e);
  }
}

export default class Rom {
  readonly _buffer: Buffer;
  readonly headerOffset: number;

  constructor(buffer: Buffer, headerOffset: number) {
    this._buffer = buffer;
    this.headerOffset = headerOffset;
  }

  static fromBuffer(buffer: Buffer) {
    const headerOffset = findHeaderOffset(buffer);
    return new Rom(buffer, headerOffset);
  }

  get validity(): number {
    return this.header.validity;
  }

  get header(): Header {
    const offset = this.headerOffset;
    const headerBuffer = this._buffer.subarray(offset, offset + 48);
    return new Header(headerBuffer);
  }
}
