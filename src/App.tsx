import { useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import { Buffer } from "buffer";
import { loadAsync as loadZipAsync } from "jszip";

import { useWrap, UpdateArg } from "./wrap";
import { parsePath } from "./utils";
import AppContext, { FileState } from "./AppData";
import { detectRomType, RomType } from "./rom/utils";

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
  file: File;
  zipped: boolean;
  zipName: string;
  romType: RomType;
}

const themeMap = new Map([
  [RomType.Gb, gbLightTheme],
  [RomType.Gba, gbaLightTheme],
  [RomType.Nes, nesLightTheme],
  [RomType.Snes, snesLightTheme],
]);

const romExts = [".gb", ".gba", ".sfc", ".nes"];

export default function App(props: {}) {
  const [fileInfo, setFileInfo] = useState<FileInfo>({
    file: new File([], ""),
    zipped: false,
    zipName: "",
    romType: RomType.Generic,
  });
  const [fileState, setFileState] = useState<FileState>(FileState.Missing);
  const [buffer, setBuffer] = useWrap<Buffer>(Buffer.alloc(0));

  const updateBuffer = (value?: UpdateArg<Buffer>) => {
    setFileState(FileState.Modified);
    setBuffer(value);
  };

  const setFile = async (file: File) => {
    let { ext } = parsePath(file.name);
    let newBuffer = Buffer.from(await file.arrayBuffer());
    let zipped = false;
    let zipName = "";

    if (ext === ".zip") {
      const zip = await loadZipAsync(file);
      for (const zName in zip.files) {
        const zFile = zip.file(zName);
        if (zFile === null) continue;
        if (zFile.dir) continue;

        const zPath = parsePath(zFile.name);
        if (romExts.includes(zPath.ext)) {
          zipName = zFile.name;
          zipped = true;
          ext = zPath.ext;
          newBuffer = Buffer.from(await zFile.async("arraybuffer"));

          break;
        }
      }
      if (!zipped) {
        console.debug("Nothing found in archive");
        return;
      }
    }

    setFileInfo({
      file: file,
      zipped: zipped,
      zipName: zipName,
      romType: detectRomType(newBuffer, ext),
    });
    setBuffer(newBuffer);
    setFileState(FileState.Opened);
  };

  const getFile = async (): Promise<File> => {
    if (fileInfo.zipped) {
      const zip = await loadZipAsync(fileInfo.file);
      zip.file(fileInfo.zipName, buffer);
      return new File(
        [await zip.generateAsync({ type: "blob" })],
        fileInfo.file.name
      );
    }
    return fileInfo.file;
  };

  const resetBuffer = async () => {
    await setFile(fileInfo.file);
  };

  const theme = themeMap.get(fileInfo.romType) || defaultTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <AppContext.Provider
          value={{
            romType: fileInfo.romType,
            setFile: setFile,
            getFile: getFile,
            buffer: buffer,
            updateBuffer: updateBuffer,
          }}
        >
          <Stack direction="column" alignItems="center" sx={{ height: "100%" }}>
            <PageHeader />
            <PageContent fileState={fileState} resetBuffer={resetBuffer} />
            <PageFooter />
          </Stack>
        </AppContext.Provider>
      </CssBaseline>
    </ThemeProvider>
  );
}
