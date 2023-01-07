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
      <TextEntry label="Size">{asBytes(romContext.buffer.length)}</TextEntry>
      <DataDivider>Checksums</DataDivider>
      <TextEntry label="CRC-32" width={8}>
        {romContext.crc32 === null ? null : asHexRaw(romContext.crc32, 8)}
      </TextEntry>
      <TextEntry label="MD5" variant="mono2" width={32}>
        {romContext.md5}
      </TextEntry>
      <TextEntry label="SHA-1" variant="mono2" width={40}>
        {romContext.sha1}
      </TextEntry>
      <TextEntry label="SHA-256" variant="mono2" width={64}>
        {romContext.sha256}
      </TextEntry>
    </>
  );
}
