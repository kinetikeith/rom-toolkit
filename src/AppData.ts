import { createContext } from "react";
import { Buffer } from "buffer";

import { UpdateArg } from "./wrap";

export enum EditorMode {
  Open,
  Header,
  Patch,
  Info,
}

export enum RomType {
  None,
  Generic,
  Gb,
  Gba,
  Nes,
  Snes,
}

interface AppContextType {
  romType: RomType;
  editorMode: EditorMode;
  setEditorMode: (mode: EditorMode) => void;
  setFile: (file: File) => Promise<void>;

  buffer: Buffer;
  updateBuffer: (arg: UpdateArg<Buffer>) => void;
}

const AppContext = createContext<AppContextType>({
  romType: RomType.None,
  editorMode: EditorMode.Open,
  setEditorMode: () => {},
  setFile: async () => {},

  buffer: Buffer.alloc(0),
  updateBuffer: () => {},
});

export default AppContext;
