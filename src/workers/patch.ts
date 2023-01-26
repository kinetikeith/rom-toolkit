import { expose, transfer } from "comlink";
import { Buffer } from "buffer";

import { bufferToPatch, PatchType } from "../rom/utils";
import IpsPatch from "../rom/IpsPatch";
import UpsPatch from "../rom/UpsPatch";
import BpsPatch from "../rom/BpsPatch";

interface UnknownPatchInfo {
  type: PatchType.Unknown;
}

export interface IpsPatchInfo {
  type: PatchType.Ips;
  nChunks: number;
  begin: number;
  end: number;
}

export interface UpsPatchInfo {
  type: PatchType.Ups;

  nChunks: number;

  patchSize: number;
  patchChecksum: number;
  patchChecksumCalc: number;

  inputSize: number;
  inputChecksum: number;

  outputSize: number;
  outputChecksum: number;
}

export interface BpsPatchInfo {
  type: PatchType.Bps;

  nActions: number;

  patchSize: number;
  patchChecksum: number;
  patchChecksumCalc: number;

  sourceSize: number;
  sourceChecksum: number;

  targetSize: number;
  targetChecksum: number;
}

export type PatchInfo =
  | UnknownPatchInfo
  | IpsPatchInfo
  | UpsPatchInfo
  | BpsPatchInfo;

const patchInterface = {
  getInfo(patchArray: Uint8Array): PatchInfo {
    const patchBuffer = Buffer.from(patchArray);
    const patch = bufferToPatch(patchBuffer);
    if (patch instanceof IpsPatch)
      return {
        type: PatchType.Ips,
        ...patch.info,
      };
    else if (patch instanceof UpsPatch)
      return {
        type: PatchType.Ups,
        ...patch.info,
      };
    else if (patch instanceof BpsPatch)
      return {
        type: PatchType.Bps,
        ...patch.info,
      };
    else return { type: PatchType.Unknown };
  },
  apply(romArray: Uint8Array, patchArray: Uint8Array): Buffer {
    const romBuffer = Buffer.from(romArray);
    const patchBuffer = Buffer.from(patchArray);
    const patch = bufferToPatch(patchBuffer);
    if (patch === undefined) return transfer(romBuffer, [romBuffer.buffer]);
    else {
      const newRomBuffer = patch.applyTo(romBuffer);
      return transfer(newRomBuffer, [newRomBuffer.buffer]);
    }
  },
};

export type PatchInterface = typeof patchInterface;

expose(patchInterface);
