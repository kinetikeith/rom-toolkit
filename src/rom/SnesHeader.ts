import { Buffer } from "buffer";

import { trimNull, padNull, keysAsHex } from "./utils";

import destinations from "./data/snesDestinations.json";

const destinationMap: Map<number, string> = keysAsHex(destinations);

export { destinationMap };

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

  get mapperCode(): number {
    return this._buffer.readUInt8(0xd5);
  }

  get cartridgeCode(): number {
    return this._buffer.readUInt8(0xd6);
  }

  get romCode(): number {
    return this._buffer.readUInt8(0xd7);
  }
  set romCode(value: number) {
    this._buffer.writeUInt8(value, 0xd7);
  }
  get romSize(): number {
    return 1024 << this.romCode;
  }

  get ramCode(): number {
    return this._buffer.readUInt8(0xd8);
  }
  set ramCode(value: number) {
    this._buffer.writeUInt8(value, 0xd8);
  }
  get ramSize(): number {
    const ramCode = this.ramCode;
    if (ramCode === 0x00) return 0;
    return 1024 << ramCode;
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
