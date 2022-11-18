import { Buffer } from "buffer";

import GbHeader from "./GbHeader";
import SnesHeader from "./SnesHeader";
import { RomType } from "../AppData";

export function detectRomType(buffer: Buffer): RomType {
  const gbHeader = GbHeader.fromRom(buffer);
  if (gbHeader.logo.isValid) return RomType.Gb;

  const snesHeader = SnesHeader.fromRom(buffer);
  if (snesHeader.validity > 0) return RomType.Snes;

  return RomType.None;
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

export function keysAsHex<T>(obj: { [key: string]: T }) {
  const map = new Map<number, T>();
  for (const [key, value] of Object.entries(obj)) {
    map.set(Number.parseInt(key, 16), value);
  }

  return map;
}
