import { Buffer } from "buffer";

import { trimNull, padNull, keysAsHex } from "./utils";
import GbLogo from "./GbLogo";

import licenseesOld from "./data/gbLicenseesOld.json";
import licenseesNew from "./data/gbLicenseesNew.json";
import romBanks from "./data/gbRomBanks.json";
import ramBanks from "./data/gbRamBanks.json";
import destinations from "./data/gbDestinations.json";
import features from "./data/gbFeatures.json";

interface MemoryInfo {
  banks: number;
  size: number;
}

const licenseeMapOld = keysAsHex(licenseesOld);
const licenseeMapNew = new Map<string, string>();
const romMap = new Map<number, MemoryInfo>();
const ramMap = new Map<number, MemoryInfo>();
const destinationMap = keysAsHex(destinations);
const featureMap = keysAsHex(features);

for (const [key, value] of Object.entries(licenseesNew)) {
  licenseeMapNew.set(key, value);
}

for (const [key, value] of Object.entries(romBanks)) {
  romMap.set(Number.parseInt(key, 16), {
    banks: value,
    size: 16384 * value,
  });
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

export default class Header {
  _buffer: Buffer;
  constructor(buffer: Buffer) {
    this._buffer = buffer;
  }

  get _logoBuffer() {
    return this._buffer.subarray(0x0104, 0x0134);
  }
  get logo() {
    return new GbLogo(this._logoBuffer);
  }
  set logo(logo: GbLogo) {
    logo._buffer.copy(this._logoBuffer);
  }

  get _titleMinBuffer() {
    return this._buffer.subarray(0x0134, 0x013f);
  }
  get titleMin(): string {
    return trimNull(this._titleMinBuffer.toString("ascii"));
  }
  set titleMin(title: string) {
    this._titleMinBuffer.write(padNull(title, 11), "ascii");
  }

  get _titleBuffer() {
    return this._buffer.subarray(0x0134, 0x0143);
  }
  get title(): string {
    return trimNull(this._titleBuffer.toString("ascii"));
  }
  set title(title: string) {
    this._titleBuffer.write(padNull(title, 15), "ascii");
  }

  get _titleMaxBuffer() {
    return this._buffer.subarray(0x0134, 0x0144);
  }
  get titleMax(): string {
    return trimNull(this._titleMaxBuffer.toString("ascii"));
  }
  set titleMax(title: string) {
    this._titleMaxBuffer.write(padNull(title, 16), "ascii");
  }

  get version(): number {
    return this._buffer.readUInt8(0x014c);
  }
  set version(value: number) {
    this._buffer.writeUInt8(value, 0x014c);
  }

  get cgbFlag(): number {
    return this._buffer.readUInt8(0x0143);
  }
  set cgbFlag(value: number) {
    this._buffer.writeUInt8(value, 0x0143);
  }

  get sgbFlag(): number {
    return this._buffer.readUInt8(0x0146);
  }
  set sgbFlag(value: number) {
    this._buffer.writeUInt8(value, 0x0146);
  }

  get cartridgeCode(): number {
    return this._buffer.readUInt8(0x0147);
  }
  set cartridgeCode(value: number) {
    this._buffer.writeUInt8(value, 0x0147);
  }

  get romCode(): number {
    return this._buffer.readUInt8(0x0148);
  }
  set romCode(value: number) {
    this._buffer.writeUInt8(value, 0x0148);
  }
  get romSize(): number | undefined {
    return 32 * 1024 * (1 << this.romCode);
  }
  get romBanks(): number | undefined {
    return 2 * (1 << this.romCode);
  }

  get ramCode(): number {
    return this._buffer.readUInt8(0x0149);
  }
  set ramCode(value: number) {
    this._buffer.writeUInt8(value, 0x0149);
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
    return this._buffer.toString("ascii", 0x0144, 0x0146);
  }
  set licenseeCodeNew(value: string) {
    this._buffer.write(padNull(value, 2), 0x0144, 2, "ascii");
  }

  get licenseeCodeOld(): number {
    return this._buffer.readUInt8(0x014b);
  }
  set licenseeCodeOld(value: number) {
    this._buffer.writeUInt8(value, 0x014b);
  }

  get manufacturerCode(): string {
    return trimNull(this._buffer.toString("ascii", 0x013f, 0x0143));
  }
  set manufacturerCode(value: string) {
    this._buffer.write(padNull(value, 4), 0x013f, 4, "ascii");
  }

  get destinationCode(): number {
    return this._buffer.readUInt8(0x014a);
  }
  set destinationCode(value: number) {
    this._buffer.writeUInt8(value, 0x014a);
  }

  get destination(): string | undefined {
    return destinationMap.get(this.destinationCode);
  }

  get headerChecksum(): number {
    return this._buffer.readUInt8(0x014d);
  }
  set headerChecksum(value: number) {
    this._buffer.writeUInt8(value, 0x014d);
  }

  get globalChecksum(): number {
    return this._buffer.readUInt16BE(0x014e);
  }

  get headerChecksumCalc(): number {
    const headerBuffer = this._buffer.subarray(0x0134, 0x014d);
    let checksum = 0x00;

    for (const byte of headerBuffer.values()) {
      checksum = mod(checksum - byte - 1, 256);
    }

    return checksum;
  }
}
