import { createContext } from "react";
import { Buffer } from "buffer";
import { Rom } from "rommage";
import { BaseRom } from "rommage/BaseRom";

type BufferUpdateFunc = (oldBuffer: Buffer) => Buffer | void;
export type BufferUpdateArg = BufferUpdateFunc | Buffer;

export interface RomContextType {
  buffer: Buffer;
  rom: BaseRom;
  updateBuffer: (arg?: BufferUpdateArg) => void;
  isModified: boolean;

  crc32: number | null;
  md5: string | null;
  sha1: string | null;
  sha256: string | null;
}

const emptyBuffer = Buffer.alloc(0);

const RomContext = createContext<RomContextType>({
  buffer: emptyBuffer,
  rom: Rom.fromBuffer(emptyBuffer),
  updateBuffer: () => {},
  isModified: false,

  crc32: null,
  md5: null,
  sha1: null,
  sha256: null,
});

interface FileContextType {
  isOpen: boolean;
  opened: File;
  setOpened: (file: File) => Promise<void>;

  getEdited: () => Promise<File>;
}

const FileContext = createContext<FileContextType>({
  isOpen: false,
  opened: new File([], ""),
  setOpened: async () => {},

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
