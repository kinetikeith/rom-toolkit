import { useContext } from "react";

import { RomContext, FileContext } from "../../AppData";
import { DataDivider, TextEntry } from "../component/data";
import { asHexRaw, asBytes } from "../format";

export default function InfoDisplay(props: { unmount?: boolean }) {
  const romContext = useContext(RomContext);
  const fileContext = useContext(FileContext);

  if (props.unmount === true) {
    return null;
  }

  return (
    <>
      <DataDivider>File</DataDivider>
      <TextEntry label="Name">{fileContext.opened.name}</TextEntry>
      <TextEntry label="Size">
        {asBytes(romContext.buffer.length) || "Unknown"}
      </TextEntry>
      <DataDivider>Checksums</DataDivider>
      <TextEntry label="CRC-32">
        {asHexRaw(romContext.getCrc32(), 8) || "Unknown"}
      </TextEntry>
      <TextEntry label="MD5">{romContext.getMd5()}</TextEntry>
      <TextEntry label="SHA-1">{romContext.getSha1()}</TextEntry>
      <TextEntry label="SHA-256">{romContext.getSha256()}</TextEntry>
    </>
  );
}
