import { Buffer } from "buffer";

import { sortBy } from "lodash";

import GbHeader from "./GbHeader";
import GbaHeader from "./GbaHeader";
import NesHeader from "./NesHeader";
import SnesHeader from "./SnesHeader";

import IpsPatch from "./IpsPatch";
import UpsPatch from "./UpsPatch";

export type Patch = IpsPatch | UpsPatch;

export enum RomType {
  Generic,
  Gb,
  Gba,
  Nes,
  Snes,
}

export function detectRomType(buffer: Buffer, ext: string): RomType {
  const headers = [
    {
      validity: GbHeader.fromRom(buffer).validity,
      type: RomType.Gb,
      ext: [".gb", ".gbc"],
    },
    {
      validity: GbaHeader.fromRom(buffer).validity,
      type: RomType.Gba,
      ext: [".gba"],
    },
    {
      validity: NesHeader.fromRom(buffer).validity,
      type: RomType.Nes,
      ext: [".nes"],
    },
    {
      validity: SnesHeader.fromRom(buffer).validity,
      type: RomType.Snes,
      ext: [".sfc"],
    },
  ];

  const bestHeader = sortBy(
    headers,
    (header) => header.validity + (header.ext.includes(ext) ? 2 : -2)
  ).pop();

  if (bestHeader === undefined) return RomType.Generic;
  else if (bestHeader.validity > 0) return bestHeader.type;

  return RomType.Generic;
}

export function fileToPatch(
  buffer: Buffer,
  fileName: string
): Patch | undefined {
  const ipsPatch = new IpsPatch(buffer, fileName);
  if (ipsPatch.validityScore > 0) return ipsPatch;

  const upsPatch = new UpsPatch(buffer, fileName);
  if (upsPatch.validityScore > 0) return upsPatch;
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
