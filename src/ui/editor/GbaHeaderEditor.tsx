import { useContext } from "react";

import AppContext from "../../AppData";
import GbaHeader from "../../rom/GbaHeader";

import { HeaderEntry, HeaderDivider } from "./HeaderEditor";
import { asHex } from "../format";

export default function GbaHeaderEditor(props: {}) {
  const context = useContext(AppContext);

  const header = GbaHeader.fromRom(context.buffer);

  return (
    <>
      <HeaderDivider>General</HeaderDivider>
      <HeaderEntry label="Title">{header.title}</HeaderEntry>
      <HeaderEntry label="Game Code">{header.gameCode}</HeaderEntry>
      <HeaderEntry label="Version">{header.version}</HeaderEntry>
      <HeaderDivider>Checksum</HeaderDivider>
      <HeaderEntry label="Header Checksum">
        {asHex(header.headerChecksum)}
      </HeaderEntry>
    </>
  );
}
