import { useContext } from "react";

import AppContext from "../../AppData";
import NesHeader, { Format } from "../../rom/NesHeader";

import { HeaderEntry, HeaderDivider } from "./HeaderEditor";
import { asHex } from "../format";

const headerFormatLabelMap = new Map([
  [Format.Raw, "Headerless"],
  [Format.INes, "iNES"],
  [Format.INes2, "NES 2.0"],
]);

export default function NesHeaderEditor(props: {}) {
  const context = useContext(AppContext);

  const header = NesHeader.fromRom(context.buffer);

  return (
    <>
      <HeaderDivider>General</HeaderDivider>
      <HeaderEntry label="Title">{header.title}</HeaderEntry>
      <HeaderDivider>Licensing</HeaderDivider>
      <HeaderEntry label="Location">{asHex(header.licenseLoc, 6)}</HeaderEntry>
      <HeaderEntry label="Complement">
        {asHex(header.licenseComplement)}
      </HeaderEntry>
      <HeaderDivider>Format</HeaderDivider>
      <HeaderEntry label="Type">
        {headerFormatLabelMap.get(header.format)}
      </HeaderEntry>
    </>
  );
}
