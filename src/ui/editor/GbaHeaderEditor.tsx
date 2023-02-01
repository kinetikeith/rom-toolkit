import { useState, useContext, useMemo } from "react";
import { GbaRom, destinationMap } from "rommage/GbaRom";

import { RomContext } from "../../AppData";

import { HeaderEntry, HeaderDivider } from "./HeaderEditor";
import StringDialog from "../dialog/StringDialog";
import IntDialog from "../dialog/IntDialog";
import ChoiceDialog from "../dialog/ChoiceDialog";
import { asHex } from "../format";

enum Field {
  None,
  Title,
  Version,
  GameCode,
  Maker,
  Destination,
}

export default function GbaHeaderEditor(props: {}) {
  const context = useContext(RomContext);
  const [field, setField] = useState<Field>(Field.None);

  const buffer = context.buffer;
  const rom = useMemo(() => GbaRom.fromBuffer(buffer), [buffer]);
  const header = useMemo(() => rom.header, [rom]);

  const setFieldTo = (value: Field) => () => setField(value);
  const closeField = () => setField(Field.None);

  const headerChecksum = header.headerChecksum;
  const headerChecksumCalc = header.headerChecksumCalc;

  const headerChecksumColor =
    headerChecksum === headerChecksumCalc ? "success.main" : "error.main";

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
        maxLength={12}
        onCancel={closeField}
        onSubmit={(value) => {
          header.title = value;

          context.updateBuffer();
          closeField();
        }}
      />
      <HeaderEntry label="Version" onEdit={setFieldTo(Field.Version)}>
        {header.version}
      </HeaderEntry>
      <IntDialog
        title="Edit Version"
        open={field === Field.Version}
        value={header.version}
        min={0x00}
        max={0xff}
        onCancel={closeField}
        onSubmit={(value) => {
          header.version = value;

          context.updateBuffer();
          closeField();
        }}
      />
      <HeaderEntry label="Game Code" onEdit={setFieldTo(Field.GameCode)}>
        {header.gameCode}
      </HeaderEntry>
      <StringDialog
        title="Edit Game Code"
        open={field === Field.GameCode}
        value={header.gameCode}
        maxLength={4}
        onCancel={closeField}
        onSubmit={(value) => {
          header.gameCode = value;

          context.updateBuffer();
          closeField();
        }}
      />
      <HeaderEntry label="Maker Code" onEdit={setFieldTo(Field.Maker)}>
        {header.makerCode}
      </HeaderEntry>
      <StringDialog
        title="Edit Maker Code"
        open={field === Field.Maker}
        value={header.makerCode}
        maxLength={4}
        onCancel={closeField}
        onSubmit={(value) => {
          header.makerCode = value;

          context.updateBuffer();
          closeField();
        }}
      />
      <HeaderEntry label="Destination" onEdit={setFieldTo(Field.Destination)}>
        {destinationMap.get(header.destinationCode) || "Unknown"}
      </HeaderEntry>
      <ChoiceDialog
        title="Edit Destination"
        open={field === Field.Destination}
        value={header.destinationCode}
        optionMap={destinationMap}
        onCancel={closeField}
        onSubmit={(value) => {
          header.destinationCode = value;

          context.updateBuffer();
          closeField();
        }}
      />
      <HeaderDivider>Checksum</HeaderDivider>
      <HeaderEntry
        label="Header Checksum"
        color={headerChecksumColor}
        onUpdate={() => {
          if (headerChecksumCalc !== headerChecksum) {
            header.headerChecksum = headerChecksumCalc;
            context.updateBuffer();
          }
        }}
      >
        {asHex(headerChecksum)}
      </HeaderEntry>
    </>
  );
}
