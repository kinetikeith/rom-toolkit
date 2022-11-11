import { Buffer } from "buffer";

import GbHeader from "./GbHeader";
import { RomType } from "../AppData";

export function detectRomType(buffer: Buffer): RomType {
  let gbHeader = new GbHeader(buffer);
  if (gbHeader.logo.isValid) {
    return RomType.Gb;
  }

  return RomType.None;
}
