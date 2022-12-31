import { useState, useCallback, useMemo } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import Stack from "@mui/material/Stack";

import { Buffer } from "buffer";
import { loadAsync as loadZipAsync } from "jszip";

import { wrap as comlinkWrap } from "comlink";
import { Checksum } from "./workers/checksum";

import { parsePath } from "./utils";
import { RomContext, FileContext, BufferUpdateArg } from "./AppData";
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

interface FileData {
  isOpen: boolean;
  file: File;
  zipped: boolean;
  zipName: string;
}

interface RomData {
  type: RomType;
  buffer: Buffer;
  isModified: boolean;
}

const themeMap = new Map([
  [RomType.Gb, gbLightTheme],
  [RomType.Gba, gbaLightTheme],
  [RomType.Nes, nesLightTheme],
  [RomType.Snes, snesLightTheme],
]);

const romExts = [".gb", ".gba", ".sfc", ".nes"];

const checksum = comlinkWrap<Checksum>(
  new Worker(new URL("./workers/checksum", import.meta.url))
);

export default function App(props: {}) {
  const [fileData, setFileData] = useState<FileData>({
    isOpen: false,
    file: new File([], ""),
    zipped: false,
    zipName: "",
  });

  const [romData, setRomData] = useState<RomData>({
    buffer: Buffer.alloc(0),
    type: RomType.Generic,
    isModified: false,
  });

  const [crc32, setCrc32] = useState<number>(0);
  const [md5, setMd5] = useState<string>("");
  const [sha1, setSha1] = useState<string>("");
  const [sha256, setSha256] = useState<string>("");

  const updateChecksums = (buffer: Buffer): void => {
    checksum.getCrc32(buffer).then(setCrc32);
    checksum.getMd5(buffer).then(setMd5);
    checksum.getSha1(buffer).then(setSha1);
    checksum.getSha256(buffer).then(setSha256);
  };

  const updateRomBuffer = useCallback((arg?: BufferUpdateArg) => {
    if (arg === undefined)
      setRomData((oldRomData) => {
        updateChecksums(oldRomData.buffer);
        return {
          ...oldRomData,
          isModified: true,
        };
      });
    else if (arg instanceof Function)
      setRomData((oldRomData) => {
        const newBuffer = arg(oldRomData.buffer);
        if (newBuffer === undefined) {
          updateChecksums(oldRomData.buffer);
          return {
            ...oldRomData,
            isModified: true,
          };
        } else {
          updateChecksums(newBuffer);
          return {
            ...oldRomData,
            isModified: true,
            buffer: newBuffer,
          };
        }
      });
    else {
      updateChecksums(arg);
      setRomData((oldRomData) => {
        return {
          ...oldRomData,
          isModified: true,
          buffer: arg,
        };
      });
    }
  }, []);

  const setOpenedFile = useCallback(async (file: File) => {
    let { ext } = parsePath(file.name);
    let buffer = Buffer.from(await file.arrayBuffer());
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
          buffer = Buffer.from(await zFile.async("arraybuffer"));

          break;
        }
      }
      if (!zipped) {
        console.debug("Nothing found in archive");
        return;
      }
    }

    setFileData({
      isOpen: true,
      file: file,
      zipped: zipped,
      zipName: zipName,
    });

    setRomData({
      buffer: buffer,
      isModified: false,
      type: detectRomType(buffer, ext),
    });

    updateChecksums(buffer);
  }, []);

  const getEditedFile = useCallback(async (): Promise<File> => {
    if (fileData.zipped) {
      const zip = await loadZipAsync(fileData.file);
      zip.file(fileData.zipName, romData.buffer);
      return new File(
        [await zip.generateAsync({ type: "blob" })],
        fileData.file.name
      );
    }
    return fileData.file;
  }, [fileData, romData]);

  const resetOpenedFile = useCallback(async () => {
    await setOpenedFile(fileData.file);
  }, [setOpenedFile, fileData]);

  const theme = themeMap.get(romData.type) || defaultTheme;

  const romContextValue = useMemo(
    () => ({
      type: romData.type,
      buffer: romData.buffer,
      updateBuffer: updateRomBuffer,
      isModified: romData.isModified,

      crc32: crc32,
      md5: md5,
      sha1: sha1,
      sha256: sha256,
    }),
    [romData, updateRomBuffer, crc32, md5, sha1, sha256]
  );

  const fileContextValue = useMemo(
    () => ({
      isOpen: fileData.isOpen,
      opened: fileData.file,
      setOpened: setOpenedFile,
      resetOpened: resetOpenedFile,

      getEdited: getEditedFile,
    }),
    [fileData, setOpenedFile, resetOpenedFile, getEditedFile]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <RomContext.Provider value={romContextValue}>
          <Stack direction="column" alignItems="center" sx={{ height: "100%" }}>
            <PageHeader />
            <FileContext.Provider value={fileContextValue}>
              <PageContent />
            </FileContext.Provider>
            <PageFooter />
          </Stack>
        </RomContext.Provider>
      </CssBaseline>
    </ThemeProvider>
  );
}
