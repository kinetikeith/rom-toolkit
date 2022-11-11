import { createContext } from "react";
import { Buffer } from "buffer";

export enum EditorMode {
  Open,
  Header,
  Patch,
  Info,
}

export enum RomType {
  None,
  Any,
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
  updateBuffer: (func: (buffer: Buffer) => any) => void;
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
