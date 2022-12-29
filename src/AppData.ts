import { createContext } from "react";
import { Buffer } from "buffer";

import { UpdateArg } from "./wrap";
import { RomType } from "./rom/utils";

export enum FileState {
  Missing,
  Opened,
  Modified,
}

interface AppContextType {
  romType: RomType;
  setFile: (file: File) => Promise<void>;
  getFile: () => Promise<File>;

  buffer: Buffer;
  updateBuffer: (arg?: UpdateArg<Buffer>) => void;
  bufferChecksum: number;
}

const AppContext = createContext<AppContextType>({
  romType: RomType.Generic,
  setFile: async () => {},
  getFile: async () => new File([], ""),

  buffer: Buffer.alloc(0),
  updateBuffer: () => {},
  bufferChecksum: 0,
});

export default AppContext;
