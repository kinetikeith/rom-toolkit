import { createContext } from "react";
import { Buffer } from "buffer";

import { UpdateArg } from "./wrap";

export enum RomType {
  Generic,
  Gb,
  Gba,
  Nes,
  Snes,
}

export enum FileState {
  Missing,
  Opened,
  Modified,
}

interface AppContextType {
  romType: RomType;
  setFile: (file: File) => Promise<void>;

  buffer: Buffer;
  updateBuffer: (arg?: UpdateArg<Buffer>) => void;
}

const AppContext = createContext<AppContextType>({
  romType: RomType.Generic,
  setFile: async () => {},

  buffer: Buffer.alloc(0),
  updateBuffer: () => {},
});

export default AppContext;
