import { useState, useContext, useMemo } from "react";
import {
  NesRom,
  Format,
  ChrType,
  Mirroring,
  chrSizeMap,
  prgSizeMap,
} from "rommage/NesRom";

import { RomContext } from "../../AppData";

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
  const rom = useMemo(() => NesRom.fromBuffer(buffer), [buffer]);
  const licenseHeader = useMemo(() => rom.licenseHeader, [rom]);

  const setFieldTo = (value: Field) => () => setField(value);
  const closeField = () => setField(Field.None);

  const licenseHeaderChecksumCalc = licenseHeader?.headerChecksumCalc;
  const licenseHeaderChecksumColor =
    licenseHeaderChecksumCalc === 0 ? "success.main" : "error.main";

  return (
    <>
      <HeaderDivider>License Header</HeaderDivider>
      {licenseHeader === null ? null : (
        <>
          <HeaderEntry label="Title" onEdit={setFieldTo(Field.Title)}>
            {licenseHeader.title}
          </HeaderEntry>
          <StringDialog
            title="Edit Title"
            open={field === Field.Title}
            value={licenseHeader.title}
            maxLength={16}
            onCancel={closeField}
            onSubmit={(value) => {
              licenseHeader.title = value;

              context.updateBuffer();
              closeField();
            }}
          />
          <HeaderEntry label="Header Location">
            {asHex(rom.licenseHeaderOffset, 6)}
          </HeaderEntry>
          <HeaderEntry label="CHR Size" onEdit={setFieldTo(Field.ChrSize)}>
            {chrSizeLabelMap.get(licenseHeader.chrCode) || "Unknown"}
          </HeaderEntry>
          <ChoiceDialog
            title="Edit CHR Size"
            open={field === Field.ChrSize}
            value={licenseHeader.chrCode}
            optionMap={chrSizeLabelMap}
            onCancel={closeField}
            onSubmit={(value) => {
              licenseHeader.chrCode = value;
              context.updateBuffer();
              closeField();
            }}
          />
          <HeaderEntry label="CHR Type" onEdit={setFieldTo(Field.ChrType)}>
            {chrTypeLabelMap.get(licenseHeader.chrType) || "Unknown"}
          </HeaderEntry>
          <ChoiceDialog
            title="Edit CHR Type"
            open={field === Field.ChrType}
            value={licenseHeader.chrType}
            optionMap={chrTypeLabelMap}
            onCancel={closeField}
            onSubmit={(value) => {
              licenseHeader.chrType = value;
              context.updateBuffer();
              closeField();
            }}
          />
          <HeaderEntry label="PRG Size" onEdit={setFieldTo(Field.PrgSize)}>
            {prgSizeLabelMap.get(licenseHeader.prgCode)}
          </HeaderEntry>
          <ChoiceDialog
            title="Edit PRG Size"
            open={field === Field.PrgSize}
            value={licenseHeader.prgCode}
            optionMap={prgSizeLabelMap}
            onCancel={closeField}
            onSubmit={(value) => {
              licenseHeader.prgCode = value;
              context.updateBuffer();
              closeField();
            }}
          />
          <HeaderEntry
            label="Nametable Mirroring"
            onEdit={setFieldTo(Field.Mirroring)}
          >
            {mirroringLabelMap.get(licenseHeader.mirroring)}
          </HeaderEntry>
          <ChoiceDialog
            title="Edit Nametable Mirroring"
            open={field === Field.Mirroring}
            value={licenseHeader.mirroring}
            optionMap={mirroringLabelMap}
            onCancel={closeField}
            onSubmit={(value) => {
              licenseHeader.mirroring = value;
              context.updateBuffer();
              closeField();
            }}
          />
          <HeaderEntry
            label="Header Complement"
            color={licenseHeaderChecksumColor}
            onUpdate={() => {
              if (
                licenseHeader.headerComplementCalc !==
                licenseHeader.headerComplement
              ) {
                licenseHeader.headerComplement =
                  licenseHeader.headerComplementCalc;
                context.updateBuffer();
              }
            }}
          >
            {asHex(licenseHeader.headerComplement)}
          </HeaderEntry>
          <HeaderEntry label="CHR Checksum">
            {asHex(licenseHeader.chrChecksum, 4)}
          </HeaderEntry>
          <HeaderEntry label="PRG Checksum">
            {asHex(licenseHeader.prgChecksum, 4)}
          </HeaderEntry>
          <HeaderDivider>Format</HeaderDivider>
        </>
      )}
      <HeaderEntry label="Type">{formatLabelMap.get(rom.format)}</HeaderEntry>
    </>
  );
}
