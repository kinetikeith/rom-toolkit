import { useState, useContext, useMemo } from "react";

import { RomContext } from "../../AppData";
import NesHeader, {
  Format,
  ChrType,
  Mirroring,
  chrSizeMap,
  prgSizeMap,
} from "../../rom/NesHeader";

import { HeaderEntry, HeaderDivider } from "./HeaderEditor";
import { asHex, asBytes } from "../format";
import StringDialog from "../dialog/StringDialog";
import ChoiceDialog from "../dialog/ChoiceDialog";

enum Field {
  None,
  Title,
  ChrSize,
  ChrType,
  PrgSize,
  Mirroring,
}

const formatLabelMap = new Map([
  [Format.Raw, "Headerless"],
  [Format.INes, "iNES"],
  [Format.INes2, "NES 2.0"],
]);

const chrTypeLabelMap = new Map([
  [ChrType.Rom, "ROM"],
  [ChrType.Ram, "RAM"],
]);

const chrSizeLabelMap = new Map<number, string>(
  [...chrSizeMap.entries()].map(([key, value]) => [
    key,
    value.map((n) => asBytes(n)).join(" or "),
  ])
);

const prgSizeLabelMap = new Map<number, string>(
  [...prgSizeMap.entries()].map(([key, value]) => [key, asBytes(value)])
);

const mirroringLabelMap = new Map([
  [Mirroring.Horizontal, "Horizontal"],
  [Mirroring.Vertical, "Vertical"],
]);

export default function NesHeaderEditor(props: {}) {
  const [field, setField] = useState<Field>(Field.None);
  const context = useContext(RomContext);
  const buffer = context.buffer;
  const header = useMemo(() => NesHeader.fromRom(buffer), [buffer]);

  const setFieldTo = (value: Field) => () => setField(value);
  const closeField = () => setField(Field.None);

  const headerChecksumCalc = header.headerChecksumCalc;
  const headerChecksumColor =
    headerChecksumCalc === 0 ? "success.main" : "error.main";

  return (
    <>
      <HeaderDivider>General</HeaderDivider>
      <HeaderEntry label="Title" onEdit={setFieldTo(Field.Title)}>
        {header.title}
      </HeaderEntry>
      <StringDialog
        title="Edit Title"
        open={field === Field.Title}
        value={header.title}
        maxLength={16}
        onCancel={closeField}
        onSubmit={(value) => {
          header.title = value;

          context.updateBuffer();
          closeField();
        }}
      />
      <HeaderEntry label="Header Location">
        {asHex(header.licenseLoc, 6)}
      </HeaderEntry>
      <HeaderDivider>Hardware</HeaderDivider>
      <HeaderEntry label="CHR Size" onEdit={setFieldTo(Field.ChrSize)}>
        {chrSizeLabelMap.get(header.chrCode) || "Unknown"}
      </HeaderEntry>
      <ChoiceDialog
        title="Edit CHR Size"
        open={field === Field.ChrSize}
        value={header.chrCode}
        optionMap={chrSizeLabelMap}
        onCancel={closeField}
        onSubmit={(value) => {
          header.chrCode = value;
          context.updateBuffer();
          closeField();
        }}
      />
      <HeaderEntry label="CHR Type" onEdit={setFieldTo(Field.ChrType)}>
        {chrTypeLabelMap.get(header.chrType) || "Unknown"}
      </HeaderEntry>
      <ChoiceDialog
        title="Edit CHR Type"
        open={field === Field.ChrType}
        value={header.chrType}
        optionMap={chrTypeLabelMap}
        onCancel={closeField}
        onSubmit={(value) => {
          header.chrType = value;
          context.updateBuffer();
          closeField();
        }}
      />
      <HeaderEntry label="PRG Size" onEdit={setFieldTo(Field.PrgSize)}>
        {prgSizeLabelMap.get(header.prgCode)}
      </HeaderEntry>
      <ChoiceDialog
        title="Edit PRG Size"
        open={field === Field.PrgSize}
        value={header.prgCode}
        optionMap={prgSizeLabelMap}
        onCancel={closeField}
        onSubmit={(value) => {
          header.prgCode = value;
          context.updateBuffer();
          closeField();
        }}
      />
      <HeaderEntry
        label="Nametable Mirroring"
        onEdit={setFieldTo(Field.Mirroring)}
      >
        {mirroringLabelMap.get(header.mirroring)}
      </HeaderEntry>
      <ChoiceDialog
        title="Edit Nametable Mirroring"
        open={field === Field.Mirroring}
        value={header.mirroring}
        optionMap={mirroringLabelMap}
        onCancel={closeField}
        onSubmit={(value) => {
          header.mirroring = value;
          context.updateBuffer();
          closeField();
        }}
      />
      <HeaderDivider>Checksums</HeaderDivider>
      <HeaderEntry
        label="Header Complement"
        color={headerChecksumColor}
        onUpdate={() => {
          if (header.headerComplementCalc !== header.headerComplement) {
            header.headerComplement = header.headerComplementCalc;
            context.updateBuffer();
          }
        }}
      >
        {asHex(header.headerComplement)}
      </HeaderEntry>
      <HeaderEntry label="CHR Checksum">
        {asHex(header.chrChecksum, 4)}
      </HeaderEntry>
      <HeaderEntry label="PRG Checksum">
        {asHex(header.prgChecksum, 4)}
      </HeaderEntry>
      <HeaderDivider>Format</HeaderDivider>
      <HeaderEntry label="Type">
        {formatLabelMap.get(header.format)}
      </HeaderEntry>
    </>
  );
}
