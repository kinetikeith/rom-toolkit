import { useState, useContext } from "react";

import AppContext from "../../AppData";
import SnesHeader, { destinationMap } from "../../rom/SnesHeader";
import StringDialog from "../dialog/StringDialog";
import IntDialog from "../dialog/IntDialog";
import ChoiceDialog from "../dialog/ChoiceDialog";
import { HeaderEntry, HeaderDivider } from "./HeaderEditor";
import { asBytes, asHex } from "../format";

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

  const setFieldTo = (value: Field) => () => setField(value);
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
      <HeaderEntry label="Maker Code" onEdit={setFieldTo(Field.MakerCode)}>
        {header.makerCode}
      </HeaderEntry>
      <StringDialog
        title="Edit Maker Code"
        open={field === Field.MakerCode}
        value={header.makerCode}
        maxLength={2}
        onCancel={closeField}
        onSubmit={(value) => {
          context.updateBuffer((buffer) => {
            const newHeader = new SnesHeader(buffer);
            newHeader.makerCode = value;
          });
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
          context.updateBuffer((buffer) => {
            const newHeader = new SnesHeader(buffer);
            newHeader.gameCode = value;
          });
          closeField();
        }}
      />
      <HeaderEntry label="Destination" onEdit={setFieldTo(Field.Destination)}>
        {header.destination || "Unknown"}
      </HeaderEntry>
      <ChoiceDialog
        title="Edit Destination"
        open={field === Field.Destination}
        value={header.destinationCode}
        optionMap={destinationMap}
        onCancel={closeField}
        onSubmit={(value) => {
          context.updateBuffer((buffer) => {
            const newHeader = new SnesHeader(buffer);
            newHeader.destinationCode = value;
          });
          closeField();
        }}
      />
      <HeaderDivider>Hardware</HeaderDivider>
      <HeaderEntry label="ROM Size">{asBytes(header.romSize)}</HeaderEntry>
      <HeaderEntry label="RAM Size">{asBytes(header.ramSize)}</HeaderEntry>
      <HeaderEntry label="Expansion RAM Size">
        {asBytes(header.ramExpansionSize)}
      </HeaderEntry>
      <HeaderDivider>Checksums</HeaderDivider>
      <HeaderEntry label="Global Checksum">
        {asHex(header.globalChecksum, 4)}
      </HeaderEntry>
      <HeaderEntry label="Global Complement">
        {asHex(header.globalComplement, 4)}
      </HeaderEntry>
    </>
  );
}
