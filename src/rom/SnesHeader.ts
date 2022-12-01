import { Buffer } from "buffer";

import { trimNull, padNull, keysAsHex } from "./utils";
import { range } from "../utils";

import destinations from "./data/snesDestinations.json";
import mappers from "./data/snesMappers.json";
import features from "./data/snesFeatures.json";

const destinationMap: Map<number, string> = keysAsHex(destinations);
const mapperMap: Map<number, string> = keysAsHex(mappers);
const featureMap: Map<number, string[]> = keysAsHex(features);

const ramMap = new Map<number, number>(range(16).map((i) => [i, 1024 << i]));
const romMap = new Map<number, number>(range(20).map((i) => [i, 1024 << i]));

export { destinationMap, ramMap, romMap, mapperMap, featureMap };

function findHeader(buffer: Buffer): [Buffer, number] {
  const offsets = [0xff00, 0x7f00, 0x40ff00];

  const scoreObjs = offsets.map((offset) => ({
    offset: offset,
    score: calcHeaderOffsetScore(offset, buffer),
  }));
  scoreObjs.sort((scoreObj) => scoreObj.score);
  const bestScoreObj = scoreObjs[scoreObjs.length - 1];
  const bestOffset = bestScoreObj.offset;
  const headerBuffer = buffer.subarray(bestOffset, bestOffset + 0xe0);

  return [headerBuffer, bestScoreObj.score];
}

function calcHeaderOffsetScore(offset: number, buffer: Buffer): number {
  let score = 0;
  if (buffer.length < offset + 0xde) return -1;
  const romCode = buffer.readUInt8(offset + 0xd7);
  const ramCode = buffer.readUInt8(offset + 0xd8);

  // TODO: Add more testing methods
  if (romCode >= 0x05 && romCode <= 0x0f) score += 1;
  if (ramCode <= 0x0a) score += 1;

  return score;
}

export default class SnesHeader {
  _buffer: Buffer;
  readonly validity: number;

  constructor(buffer: Buffer, validity: number = 0) {
    this._buffer = buffer;
    this.validity = validity;
  }

  static fromRom(buffer: Buffer): SnesHeader {
    const [foundBuffer, validity] = findHeader(buffer);
    return new SnesHeader(foundBuffer, validity);
  }

  copy(): SnesHeader {
    return new SnesHeader(this._buffer, this.validity);
  }

  get makerCode(): string {
    return trimNull(this._buffer.toString("ascii", 0xb0, 0xb2));
  }
  set makerCode(value: string) {
    this._buffer.write(padNull(value, 4), 0xb0, 2, "ascii");
  }

  get gameCode(): string {
    return trimNull(this._buffer.toString("ascii", 0xb2, 0xb6));
  }
  set gameCode(value: string) {
    this._buffer.write(padNull(value, 4), 0xb2, 4, "ascii");
  }

  get ramExpansionCode(): number {
    return this._buffer.readUInt16LE(0xbd);
  }
  set ramExpansionCode(value: number) {
    this._buffer.writeUInt16LE(value, 0xbd);
  }
  get ramExpansionSize(): number {
    const ramExpansionCode = this.ramExpansionCode;
    return ramExpansionCode === 0x00 ? 0 : 1024 << ramExpansionCode;
  }

  get versionSpecial(): number {
    return this._buffer.readUInt8(0xbe);
  }

  get cartridgeSubCode(): number {
    return this._buffer.readUInt8(0xbf);
  }

  get title(): string {
    return this._buffer.toString("utf8", 0xc0, 0xd5).trimEnd();
  }
  set title(value: string) {
    this._buffer.write(value.padEnd(21, " "), 0xc0, 21, "utf8");
  }

  get mapModeCode(): number {
    return this._buffer.readUInt8(0xd5);
  }
  get mapperCode(): number {
    return this.mapModeCode & 0x0f;
  }
  set mapperCode(value: number) {
    const code = this.mapModeCode;
    this._buffer.writeUInt8((0xf0 & code) | (value & 0x0f), 0xd5);
  }
  get mapper(): string | undefined {
    return mapperMap.get(this.mapperCode);
  }
  get isMapperFast(): number {
    return this.mapModeCode & 0x10;
  }

  get cartridgeCode(): number {
    return this._buffer.readUInt8(0xd6);
  }
  get features(): string[] {
    const code = this.cartridgeCode;
    const subCode = this.cartridgeSubCode;
    const gameCode = this.gameCode;
    const rom1mb = this.romCode > 0x0a;

    if (code === 0x14) {
      return ["ROM", "RAM", rom1mb ? "GSU-1" : "GSU-2"];
    } else if (code === 0x15) {
      return ["ROM", "RAM", rom1mb ? "GSU-1" : "GSU-2", "Battery"];
    } else if (code === 0xf3) {
      if (subCode === 0x10) return ["ROM", "CX4"];
    } else if (code === 0xf5) {
      if (subCode === 0x00) return ["ROM", "RAM", "SPC7110", "Battery"];
      else if (subCode === 0x02) return ["ROM", "RAM", "ST-018", "Battery"];
    } else if (code === 0xf6) {
      if (subCode === 0x01) return ["ROM", "ST-010/011", "Battery"];
    } else if (code === 0xf9) {
      if (subCode === 0x00) return ["ROM", "RAM", "SPC7110", "RTC", "Battery"];
    } else if (gameCode === "XBND")
      return ["ROM", "RAM", "Battery", "XBand Modem"];
    else if (gameCode === "MENU")
      return ["ROM", "RAM", "Battery", "MX15001TFC"];

    return featureMap.get(code) || [];
  }

  get romCode(): number {
    return this._buffer.readUInt8(0xd7);
  }
  set romCode(value: number) {
    this._buffer.writeUInt8(value, 0xd7);
  }
  get romSize(): number | undefined {
    return romMap.get(this.romCode);
  }

  get ramCode(): number {
    return this._buffer.readUInt8(0xd8);
  }
  set ramCode(value: number) {
    this._buffer.writeUInt8(value, 0xd8);
  }
  get ramSize(): number | undefined {
    return ramMap.get(this.ramCode);
  }

  get destinationCode(): number {
    return this._buffer.readUInt8(0xd9);
  }
  set destinationCode(value: number) {
    this._buffer.writeUInt8(value, 0xd9);
  }
  get destination(): string | undefined {
    return destinationMap.get(this.destinationCode);
  }

  get isNewFormat(): boolean {
    return this._buffer.readUInt8(0xda) === 0x33;
  }

  get version(): number {
    return this._buffer.readUInt8(0xdb);
  }
  set version(value: number) {
    this._buffer.writeUInt8(value, 0xdb);
  }

  get globalChecksum(): number {
    return this._buffer.readUInt16LE(0xdc);
  }
  get globalComplement(): number {
    return this._buffer.readUInt16LE(0xde);
  }
}
