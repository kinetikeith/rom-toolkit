import { useState, useMemo, useContext } from "react";

import {
  SnesRom,
  mapperMap,
  destinationMap,
  ramMap,
  romMap,
  featureMap,
} from "rommage/SnesRom";

import SdCardIcon from "@mui/icons-material/SdCard";
import MemoryIcon from "@mui/icons-material/Memory";
import BatteryIcon from "@mui/icons-material/Battery5Bar";
import ClockIcon from "@mui/icons-material/AccessTime";
import MathIcon from "@mui/icons-material/Calculate";
import ZipIcon from "@mui/icons-material/FolderZip";
import ProcessorIcon from "@mui/icons-material/DeveloperBoard";
import DspIcon from "@mui/icons-material/GraphicEq";
import SpriteIcon from "@mui/icons-material/Animation";
import CubeIcon from "@mui/icons-material/ViewInAr";
import AiIcon from "@mui/icons-material/Psychology";
import GameIcon from "@mui/icons-material/VideogameAsset";
import FlashIcon from "@mui/icons-material/FlashOn";
import RouterIcon from "@mui/icons-material/Router";
import HelpIcon from "@mui/icons-material/Help";

import { RomContext } from "../../AppData";
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
  Features,
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

const featureCodeLabelMap = new Map<number, string>(
  [...featureMap.entries()].map(([key, value]) => [key, value.join(", ")])
);

function CartridgeFeatures(props: { code: number }) {
  const featureList = featureMap.get(props.code) || ["Unknown"];
  const icons = featureList.map((feature) => {
    if (feature === "ROM") return SdCardIcon;
    else if (feature === "RAM") return MemoryIcon;
    else if (feature === "Battery") return BatteryIcon;
    else if (feature === "RTC") return ClockIcon;
    else if (feature === "MARIO Chip 1") return CubeIcon;
    else if (feature === "GSU-1") return CubeIcon;
    else if (feature === "GSU-2") return CubeIcon;
    else if (feature === "GSU-2-SP1") return CubeIcon;
    else if (feature === "Cx4") return MathIcon;
    else if (feature === "DSP") return DspIcon;
    else if (feature === "DSP-1") return DspIcon;
    else if (feature === "DSP-2") return DspIcon;
    else if (feature === "DSP-3") return DspIcon;
    else if (feature === "DSP-4") return DspIcon;
    else if (feature === "LR35902") return GameIcon;
    else if (feature === "MX15001TFC") return FlashIcon;
    else if (feature === "OBC-1") return SpriteIcon;
    else if (feature === "RC2324DPL") return RouterIcon;
    else if (feature === "BS-X") return RouterIcon;
    else if (feature === "S-DD1") return ZipIcon;
    else if (feature === "S-RTC") return ClockIcon;
    else if (feature === "SA1") return ProcessorIcon;
    else if (feature === "SPC7110") return ZipIcon;
    else if (feature === "ST-010/011") return AiIcon;
    else if (feature === "ST-018") return AiIcon;
    else return HelpIcon;
  });

  return (
    <>
      {icons.map((Icon, index) => (
        <Icon key={index} />
      ))}
    </>
  );
}

export default function SnesHeaderEditor(props: {}) {
  const [field, setField] = useState<Field>(Field.None);
  const context = useContext(RomContext);
  const buffer = context.buffer;
  const rom = useMemo(() => SnesRom.fromBuffer(buffer), [buffer]);
  const header = useMemo(() => rom.header, [rom]);

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
      <HeaderEntry label="Location">{asHex(rom.headerOffset, 6)}</HeaderEntry>
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
      <HeaderEntry
        label="Cartidge Features"
        onEdit={setFieldTo(Field.Features)}
      >
        <CartridgeFeatures code={header.featureCode} />
      </HeaderEntry>
      <ChoiceDialog
        title="Edit Cartridge Features"
        open={field === Field.Features}
        value={header.featureCode}
        optionMap={featureCodeLabelMap}
        onCancel={closeField}
        onSubmit={(value) => {
          header.featureCode = value;

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
