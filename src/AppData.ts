import { createContext } from "react";
import { Buffer } from "buffer";

import { RomType } from "./rom/utils";

type BufferUpdateFunc = (oldBuffer: Buffer) => Buffer | void;
export type BufferUpdateArg = BufferUpdateFunc | Buffer;

export interface RomContextType {
  type: RomType;
  buffer: Buffer;
  updateBuffer: (arg?: BufferUpdateArg) => void;
  isModified: boolean;

  crc32: number;
  md5: string;
  sha1: string;
  sha256: string;
}

const RomContext = createContext<RomContextType>({
  type: RomType.Generic,
  buffer: Buffer.alloc(0),
  updateBuffer: () => {},
  isModified: false,

  crc32: 0,
  md5: "",
  sha1: "",
  sha256: "",
});

interface FileContextType {
  isOpen: boolean;
  opened: File;
  setOpened: (file: File) => Promise<void>;
  resetOpened: () => Promise<void>;

  getEdited: () => Promise<File>;
}

const FileContext = createContext<FileContextType>({
  isOpen: false,
  opened: new File([], ""),
  setOpened: async () => {},
  resetOpened: async () => {},

  getEdited: async () => new File([], ""),
});

interface PatchContextType {
  files: Map<number, File>;
  add: (file: File) => void;
  remove: (id: number) => void;
}

const PatchContext = createContext<PatchContextType>({
  files: new Map([]),
  add: () => {},
  remove: () => {},
});

export { RomContext, FileContext, PatchContext };
