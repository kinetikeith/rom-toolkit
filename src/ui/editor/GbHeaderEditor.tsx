import { useState, useContext } from "react";

import SdCardIcon from "@mui/icons-material/SdCard";
import MemoryIcon from "@mui/icons-material/Memory";
import VibrationIcon from "@mui/icons-material/Vibration";
import SensorsIcon from "@mui/icons-material/Sensors";
import BatteryIcon from "@mui/icons-material/Battery5Bar";
import CameraIcon from "@mui/icons-material/CameraAlt";
import PetsIcon from "@mui/icons-material/Pets";
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HelpIcon from "@mui/icons-material/Help";

import AppContext from "../../AppData";
import GbHeader, {
  romMap,
  ramMap,
  destinationMap,
  featureMap,
} from "../../rom/GbHeader";
import { HeaderEntry, HeaderDivider } from "./HeaderEditor";
import { asHex, asBytes, asMemory } from "../format";

import StringDialog from "../dialog/StringDialog";
import IntDialog from "../dialog/IntDialog";
import HexDialog from "../dialog/HexDialog";
import ChoiceDialog from "../dialog/ChoiceDialog";
import GbLogoDialog from "../dialog/GbLogoDialog";
import GbLicenseeDialog from "../dialog/GbLicenseeDialog";

enum Field {
  None,
  Title,
  Version,
  Licensee,
  Logo,
  Manufacturer,
  Destination,
  CgbFlag,
  SgbFlag,
  RomSize,
  RamSize,
  Features,
}

const romCodeLabelMap = new Map<number, string>(
  [...romMap.entries()].map(([key, value]) => [
    key,
    asMemory(value.size, value.banks),
  ])
);

const ramCodeLabelMap = new Map<number, string>(
  [...ramMap.entries()].map(([key, value]) => [
    key,
    asMemory(value.size, value.banks),
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
    else if (feature === "Rumble") return VibrationIcon;
    else if (feature === "Timer") return AccessTimeIcon;
    else if (feature === "Sensor") return SensorsIcon;
    else if (feature === "Camera") return CameraIcon;
    else if (feature === "TAMA5") return PetsIcon;
    else if (feature === "MBC1") return DeveloperBoardIcon;
    else if (feature === "MBC2") return DeveloperBoardIcon;
    else if (feature === "MBC3") return DeveloperBoardIcon;
    else if (feature === "MBC5") return DeveloperBoardIcon;
    else if (feature === "MBC6") return DeveloperBoardIcon;
    else if (feature === "MBC7") return DeveloperBoardIcon;
    else if (feature === "MMM01") return DeveloperBoardIcon;
    else if (feature === "HuC3") return DeveloperBoardIcon;
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

export default function GbHeaderEditor(props: {}) {
  const [field, setField] = useState<Field>(Field.None);
  const context = useContext(AppContext);

  const header = new GbHeader(context.buffer);

  const closeField = () => setField(Field.None);

  const headerChecksum = header.headerChecksum;
  const headerChecksumCalc = header.headerChecksumCalc;
  const headerChecksumColor =
    headerChecksum === headerChecksumCalc ? "success.main" : "error.main";
  const logo = header.logo;
  const isLogoValid = logo.isValid;
  const logoValidColor = isLogoValid ? "success.main" : "error.main";

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
        maxLength={11}
        onCancel={closeField}
        onSubmit={(value) => {
          context.updateBuffer((buffer) => {
            const newHeader = new GbHeader(buffer);
            newHeader.titleMin = value;
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
            const newHeader = new GbHeader(buffer);
            newHeader.version = value;
          });
          closeField();
        }}
      />

      <HeaderDivider>Licensing</HeaderDivider>
      <HeaderEntry label="Licensee" onEdit={() => setField(Field.Licensee)}>
        {header.licensee || "Unknown"}
      </HeaderEntry>
      <GbLicenseeDialog
        title="Edit Licensee"
        value={{
          codeOld: header.licenseeCodeOld,
          codeNew: header.licenseeCodeNew,
        }}
        open={field === Field.Licensee}
        onCancel={closeField}
        onSubmit={(value) => {
          context.updateBuffer((buffer) => {
            const newHeader = new GbHeader(buffer);
            newHeader.licenseeCodeOld = value.codeOld;
            newHeader.licenseeCodeNew = value.codeNew;
          });
          closeField();
        }}
      />
      <HeaderEntry
        label="Logo"
        color={logoValidColor}
        onEdit={() => setField(Field.Logo)}
      >
        {isLogoValid ? "Valid" : "Invalid"}
      </HeaderEntry>
      <GbLogoDialog
        title="Edit Logo"
        open={field === Field.Logo}
        value={logo}
        onCancel={closeField}
        onSubmit={(value) => {
          context.updateBuffer((buffer) => {
            const newHeader = new GbHeader(buffer);
            newHeader.logo = value;
          });
          closeField();
        }}
      />
      <HeaderEntry
        label="Manufacturer Code"
        onEdit={() => setField(Field.Manufacturer)}
      >
        {header.manufacturerCode}
      </HeaderEntry>
      <StringDialog
        title="Edit Manufacturer Code"
        open={field === Field.Manufacturer}
        value={header.manufacturerCode}
        maxLength={4}
        onCancel={closeField}
        onSubmit={(value) => {
          context.updateBuffer((buffer) => {
            const newHeader = new GbHeader(buffer);
            newHeader.manufacturerCode = value;
          });
          closeField();
        }}
      />
      <HeaderEntry
        label="Destination"
        onEdit={() => setField(Field.Destination)}
      >
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
            const newHeader = new GbHeader(buffer);
            newHeader.destinationCode = value;
          });
          closeField();
        }}
      />
      <HeaderDivider>System</HeaderDivider>
      <HeaderEntry label="CGB Flag" onEdit={() => setField(Field.CgbFlag)}>
        {asHex(header.cgbFlag)}
      </HeaderEntry>
      <HexDialog
        title="Edit CGB Flag"
        open={field === Field.CgbFlag}
        value={header.cgbFlag}
        nChars={2}
        onCancel={closeField}
        onSubmit={(value) => {
          context.updateBuffer((buffer) => {
            const newHeader = new GbHeader(buffer);
            newHeader.cgbFlag = value;
          });
          closeField();
        }}
      />
      <HeaderEntry label="SGB Flag" onEdit={() => setField(Field.SgbFlag)}>
        {asHex(header.sgbFlag)}
      </HeaderEntry>
      <HexDialog
        title="Edit SGB Flag"
        open={field === Field.SgbFlag}
        value={header.sgbFlag}
        nChars={2}
        onCancel={closeField}
        onSubmit={(value) => {
          context.updateBuffer((buffer) => {
            const newHeader = new GbHeader(buffer);
            newHeader.sgbFlag = value;
          });
          closeField();
        }}
      />
      <HeaderDivider>Hardware</HeaderDivider>
      <HeaderEntry label="ROM Size" onEdit={() => setField(Field.RomSize)}>
        {asBytes(header.romSize)}
      </HeaderEntry>
      <ChoiceDialog
        title="Edit ROM Size"
        open={field === Field.RomSize}
        value={header.romCode}
        optionMap={romCodeLabelMap}
        onCancel={closeField}
        onSubmit={(value) => {
          context.updateBuffer((buffer) => {
            const newHeader = new GbHeader(buffer);
            newHeader.romCode = value;
          });
          closeField();
        }}
      />
      <HeaderEntry label="RAM Size" onEdit={() => setField(Field.RamSize)}>
        {asBytes(header.ramSize)}
      </HeaderEntry>
      <ChoiceDialog
        title="Edit RAM Size"
        open={field === Field.RamSize}
        value={header.ramCode}
        optionMap={ramCodeLabelMap}
        onCancel={closeField}
        onSubmit={(value) => {
          context.updateBuffer((buffer) => {
            const newHeader = new GbHeader(buffer);
            newHeader.ramCode = value;
          });
          closeField();
        }}
      />
      <HeaderEntry
        label="Cartridge Features"
        onEdit={() => setField(Field.Features)}
      >
        <CartridgeFeatures code={header.cartridgeCode} />
      </HeaderEntry>
      <ChoiceDialog
        title="Edit Cartridge Features"
        open={field === Field.Features}
        value={header.cartridgeCode}
        optionMap={featureCodeLabelMap}
        onCancel={closeField}
        onSubmit={(value) => {
          context.updateBuffer((buffer) => {
            const newHeader = new GbHeader(buffer);
            newHeader.cartridgeCode = value;
          });
          closeField();
        }}
      />
      <HeaderDivider>Checksums</HeaderDivider>
      <HeaderEntry
        label="Header Checksum"
        color={headerChecksumColor}
        onUpdate={() => {
          context.updateBuffer((buffer) => {
            const newHeader = new GbHeader(buffer);
            newHeader.headerChecksum = newHeader.headerChecksumCalc;
          });
        }}
      >
        {asHex(headerChecksum)}
      </HeaderEntry>
      <HeaderEntry label="Global Checksum">
        {asHex(header.globalChecksum, 4)}
      </HeaderEntry>
    </>
  );
}
