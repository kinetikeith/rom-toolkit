import { Buffer } from "buffer";

import { trimNull, padNull, keysAsHex } from "./utils";
import { range } from "../utils";
import GbLogo from "./GbLogo";

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

export {
  licenseeMapOld,
  licenseeMapNew,
  romMap,
  ramMap,
  destinationMap,
  featureMap,
};

// https://stackoverflow.com/a/64808910
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export default class GbHeader {
  _buffer: Buffer;
  constructor(buffer: Buffer) {
    this._buffer = buffer;
  }

  static fromRom(buffer: Buffer) {
    return new GbHeader(buffer.subarray(0x0100, 0x0150));
  }

  copy(): GbHeader {
    return new GbHeader(this._buffer);
  }

  get _logoBuffer() {
    return this._buffer.subarray(0x04, 0x34);
  }
  get logo() {
    return new GbLogo(this._logoBuffer);
  }
  set logo(logo: GbLogo) {
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
    const headerBuffer = this._buffer.subarray(0x34, 0x4d);
    let checksum = 0x00;

    for (const byte of headerBuffer.values()) {
      checksum = mod(checksum - byte - 1, 256);
    }

    return checksum;
  }
}
