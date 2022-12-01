import { useState, useContext } from "react";

import AppContext from "../../AppData";
import SnesHeader, {
  mapperMap,
  destinationMap,
  ramMap,
  romMap,
} from "../../rom/SnesHeader";
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
  Mapper,
  RomSize,
  RamSize,
}

const ramCodeLabelMap = new Map<number, string>(
  [...ramMap.entries()].map(([key, value]) => [
    key,
    asBytes(value) || "Unknown",
  ])
);

const romCodeLabelMap = new Map<number, string>(
  [...romMap.entries()].map(([key, value]) => [
    key,
    asBytes(value) || "Unknown",
  ])
);

export default function SnesHeaderEditor(props: {}) {
  const [field, setField] = useState<Field>(Field.None);
  const context = useContext(AppContext);

  const header = SnesHeader.fromRom(context.buffer);

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
          header.title = value;

          context.updateBuffer();
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
          header.version = value;

          context.updateBuffer();
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
          header.makerCode = value;

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
          header.destinationCode = value;

          context.updateBuffer();
          closeField();
        }}
      />
      <HeaderDivider>Hardware</HeaderDivider>
      <HeaderEntry label="ROM Size" onEdit={setFieldTo(Field.RomSize)}>
        {asBytes(header.romSize)}
      </HeaderEntry>
      <ChoiceDialog
        title="Edit ROM Size"
        open={field === Field.RomSize}
        value={header.romCode}
        optionMap={romCodeLabelMap}
        onCancel={closeField}
        onSubmit={(value) => {
          header.romCode = value;

          context.updateBuffer();
          closeField();
        }}
      />
      <HeaderEntry label="ROM Mapper" onEdit={setFieldTo(Field.Mapper)}>
        {header.mapper || "Unknown"}
      </HeaderEntry>
      <ChoiceDialog
        title="Edit ROM Mapper"
        open={field === Field.Mapper}
        value={header.mapperCode}
        optionMap={mapperMap}
        onCancel={closeField}
        onSubmit={(value) => {
          header.mapperCode = value;

          context.updateBuffer();
          closeField();
        }}
      />
      <HeaderEntry label="RAM Size" onEdit={setFieldTo(Field.RamSize)}>
        {asBytes(header.ramSize)}
      </HeaderEntry>
      <ChoiceDialog
        title="Edit RAM Size"
        open={field === Field.RamSize}
        value={header.ramCode}
        optionMap={ramCodeLabelMap}
        onCancel={closeField}
        onSubmit={(value) => {
          header.ramCode = value;

          context.updateBuffer();
          closeField();
        }}
      />
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
