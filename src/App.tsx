import { useState } from "react";
import { Buffer } from "buffer";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import Stack from "@mui/material/Stack";

import { useWrap, UpdateArg } from "./wrap";
import AppContext, { RomType, FileState } from "./AppData";
import { detectRomType } from "./rom/utils";

import PageHeader from "./ui/PageHeader";
import PageContent from "./ui/PageContent";
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
  const [fileState, setFileState] = useState<FileState>(FileState.Missing);
  const [buffer, setBuffer] = useWrap<Buffer>(Buffer.alloc(0));

  const updateBuffer = (value: UpdateArg<Buffer>) => {
    setFileState(FileState.Modified);
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
    setFileState(FileState.Opened);
  };

  const theme = themeMap.get(fileInfo.romType) || defaultTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <AppContext.Provider
          value={{
            romType: fileInfo.romType,
            setFile: setFile,
            buffer: buffer,
            updateBuffer: updateBuffer,
          }}
        >
          <Stack direction="column" alignItems="center" sx={{ height: "100%" }}>
            <PageHeader />
            <PageContent
              fileState={fileState}
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
