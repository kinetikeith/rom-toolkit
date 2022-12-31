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

  getCrc32: () => number;
  getMd5: () => string;
  getSha1: () => string;
  getSha256: () => string;
}

const RomContext = createContext<RomContextType>({
  type: RomType.Generic,
  buffer: Buffer.alloc(0),
  updateBuffer: () => {},
  isModified: false,

  getCrc32: () => 0,
  getMd5: () => "",
  getSha1: () => "",
  getSha256: () => "",
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

export { RomContext, FileContext };
