import { useState, useContext } from "react";

import AppContext from "../../AppData";
import SnesHeader from "../../rom/SnesHeader";
import StringDialog from "../dialog/StringDialog";
import IntDialog from "../dialog/IntDialog";
import { HeaderEntry, HeaderDivider } from "./HeaderEditor";
import { asBytes } from "../format";

enum Field {
  None,
  Title,
  Version,
  MakerCode,
  GameCode,
  Destination,
  RomSize,
  RamSize,
}

export default function SnesHeaderEditor(props: {}) {
  const [field, setField] = useState<Field>(Field.None);
  const context = useContext(AppContext);

  const header = new SnesHeader(context.buffer);

  const closeField = () => setField(Field.None);

  return (
    <>
      <HeaderDivider>General</HeaderDivider>
      <HeaderEntry label="Title" onEdit={() => setField(Field.Title)}>
        {header.title}
      </HeaderEntry>
      <StringDialog
        title="Edit Title"
        open={field === Field.Title}
        value={header.title}
        maxLength={21}
        onCancel={closeField}
        onSubmit={(value) => {
          context.updateBuffer((buffer) => {
            const newHeader = new SnesHeader(buffer);
            newHeader.title = value;
          });
          closeField();
        }}
      />
      <HeaderEntry label="Version" onEdit={() => setField(Field.Version)}>
        {header.version}
      </HeaderEntry>
      <IntDialog
        title="Edit Version"
        open={field === Field.Version}
        value={header.version}
        min={0}
        max={255}
        onCancel={closeField}
        onSubmit={(value) => {
          context.updateBuffer((buffer) => {
            const newHeader = new SnesHeader(buffer);
            newHeader.version = value;
          });
          closeField();
        }}
      />
      <HeaderDivider>Licensing</HeaderDivider>
      <HeaderEntry label="Maker Code">{header.makerCode}</HeaderEntry>
      <HeaderEntry label="Game Code">{header.gameCode}</HeaderEntry>
      <HeaderEntry label="Destination">
        {header.destination || "Unknown"}
      </HeaderEntry>
      <HeaderDivider>Hardware</HeaderDivider>
      <HeaderEntry label="ROM Size">{asBytes(header.romSize)}</HeaderEntry>
      <HeaderEntry label="RAM Size">{asBytes(header.ramSize)}</HeaderEntry>
      <HeaderEntry label="Expansion RAM Size">
        {asBytes(header.expansionRamSize)}
      </HeaderEntry>
    </>
  );
}
