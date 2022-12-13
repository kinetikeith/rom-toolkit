import { useState, useContext } from "react";

import AppContext from "../../AppData";
import GbaHeader, { destinationMap } from "../../rom/GbaHeader";

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
  const context = useContext(AppContext);
  const [field, setField] = useState<Field>(Field.None);

  const setFieldTo = (value: Field) => () => setField(value);
  const closeField = () => setField(Field.None);

  const header = GbaHeader.fromRom(context.buffer);

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
      <HeaderEntry label="Game Code">{header.gameCode}</HeaderEntry>
      <HeaderEntry label="Maker Code">{header.makerCode}</HeaderEntry>
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
      <HeaderEntry label="Header Checksum">
        {asHex(header.headerChecksum)}
      </HeaderEntry>
    </>
  );
}
