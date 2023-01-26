import { Buffer } from "buffer";

import { sortBy } from "lodash";

import GbRom from "./GbRom";
import GbaRom from "./GbaRom";
import NesRom from "./NesRom";
import SnesRom from "./SnesRom";

import IpsPatch from "./IpsPatch";
import UpsPatch from "./UpsPatch";
import BpsPatch from "./BpsPatch";

export type Patch = IpsPatch | UpsPatch | BpsPatch;

export enum RomType {
  Generic = -1,
  Gb,
  Gba,
  Nes,
  Snes,
}

export enum PatchType {
  Unknown = -1,
  Ips,
  Ups,
  Bps,
}

export function detectRomType(buffer: Buffer, ext: string): RomType {
  const roms = [
    {
      validity: GbRom.fromBuffer(buffer).validity,
      type: RomType.Gb,
      ext: [".gb", ".gbc"],
    },
    {
      validity: GbaRom.fromBuffer(buffer).validity,
      type: RomType.Gba,
      ext: [".gba"],
    },
    {
      validity: NesRom.fromBuffer(buffer).validity,
      type: RomType.Nes,
      ext: [".nes"],
    },
    {
      validity: SnesRom.fromBuffer(buffer).validity,
      type: RomType.Snes,
      ext: [".sfc"],
    },
  ];

  const bestRom = sortBy(
    roms,
    (rom) => rom.validity + (rom.ext.includes(ext) ? 2 : -2)
  ).pop();

  if (bestRom === undefined) return RomType.Generic;
  else if (bestRom.validity > 0) return bestRom.type;

  return RomType.Generic;
}

export function bufferToPatch(buffer: Buffer): Patch | undefined {
  const ipsPatch = new IpsPatch(buffer);
  if (ipsPatch.validityScore > 0) return ipsPatch;

  const upsPatch = new UpsPatch(buffer);
  if (upsPatch.validityScore > 0) return upsPatch;

  const bpsPatch = new BpsPatch(buffer);
  if (bpsPatch.validityScore > 0) return bpsPatch;
}

export function trim(value: string, char: string) {
  const clipIndex = value.indexOf(char);
  if (clipIndex >= 0) return value.substring(0, clipIndex);
  return value;
}

export function trimNull(value: string) {
  return trim(value, "\x00");
}

export function trimSpace(value: string) {
  return trim(value, " ");
}

export function padNull(value: string, n: number) {
  return value.padEnd(n, "\x00");
}

// https://stackoverflow.com/a/64808910
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function range(
  a: number,
  b: number | undefined = undefined,
  step: number = 1
) {
  const start = b === undefined ? 0 : a;
  const stop = b === undefined ? a : b;
  return Array.from({ length: Math.ceil((stop - start) / step) }).map(
    (_, i) => start + i * step
  );
}

export function keysAsHex<T>(obj: { [key: string]: T }) {
  const map = new Map<number, T>();
  for (const [key, value] of Object.entries(obj)) {
    map.set(Number.parseInt(key, 16), value);
  }

  return map;
}

export function readVUInt(buffer: Buffer, offset: number): [number, number] {
  let value = 0,
    shift = 0;

  while (true) {
    const octet = buffer.readUInt8(offset);
    offset += 1;
    if (octet & 0x80) {
      value += (octet & 0x7f) << shift;
      break;
    }
    value += (octet | 0x80) << shift;
    shift += 7;
  }

  return [value, offset];
}

export function readVInt(buffer: Buffer, offset: number): [number, number] {
  let value;
  [value, offset] = readVUInt(buffer, offset);
  return [(value & 1 ? -1 : +1) * (value >> 1), offset];
}
