import { useState } from "react";
import { Buffer } from "buffer";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import Stack from "@mui/material/Stack";

import { useWrap } from "./wrap";
import AppContext, { RomType, EditorMode } from "./AppData";
import { detectRomType } from "./rom/utils";

import PageHeader from "./ui/PageHeader";
import Content from "./ui/Content";
import PageFooter from "./ui/PageFooter";
import {
  defaultTheme,
  gbLightTheme,
  gbaLightTheme,
  nesLightTheme,
  snesLightTheme,
} from "./ui/theme";

interface FileInfo {
  name: string;
  romType: RomType;
  arrayBuffer: ArrayBuffer;
}

const themeMap = new Map([
  [RomType.Gb, gbLightTheme],
  [RomType.Gba, gbaLightTheme],
  [RomType.Nes, nesLightTheme],
  [RomType.Snes, snesLightTheme],
]);

export default function App(props: {}) {
  const [fileInfo, setFileInfo] = useState<FileInfo>({
    name: "",
    romType: RomType.None,
    arrayBuffer: new ArrayBuffer(0),
  });
  const [editorMode, setEditorMode] = useState<EditorMode>(EditorMode.Open);
  const [isModified, setIsModified] = useState<boolean>(false);
  const [buffer, setBuffer] = useWrap<Buffer>(Buffer.alloc(0));

  const updateBuffer = (value: (oldObj: Buffer) => undefined) => {
    setIsModified(true);
    setBuffer(value);
  };

  const resetBuffer = () => {
    const newBuffer = Buffer.from(fileInfo.arrayBuffer);
    setBuffer(newBuffer);
  };

  const setFile = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const newBuffer = Buffer.from(arrayBuffer);

    setFileInfo({
      name: file.name,
      romType: detectRomType(newBuffer),
      arrayBuffer: arrayBuffer,
    });
    setBuffer(newBuffer);
    setEditorMode(EditorMode.Header);
    setIsModified(false);
  };

  const theme = themeMap.get(fileInfo.romType) || defaultTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <AppContext.Provider
          value={{
            romType: fileInfo.romType,
            editorMode: editorMode,
            setEditorMode: setEditorMode,
            setFile: setFile,
            buffer: buffer,
            updateBuffer: updateBuffer,
          }}
        >
          <Stack direction="column" alignItems="center" sx={{ height: "100%" }}>
            <PageHeader />
            <Content
              isModified={isModified}
              resetBuffer={resetBuffer}
              fileName={fileInfo.name}
            />
            <PageFooter />
          </Stack>
        </AppContext.Provider>
      </CssBaseline>
    </ThemeProvider>
  );
}
