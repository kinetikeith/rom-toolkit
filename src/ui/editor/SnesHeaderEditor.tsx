import { useContext } from "react";

import Box from "@mui/material/Box";

import AppContext from "../../AppData";
import SnesHeader from "../../rom/SnesHeader";
import { HeaderEntry, HeaderDivider } from "./HeaderEditor";
import { asBytes } from "../format";

export default function SnesHeaderEditor(props: {}) {
  const context = useContext(AppContext);

  const header = new SnesHeader(context.buffer);

  return (
    <Box sx={{ p: 2 }}>
      <HeaderDivider>General</HeaderDivider>
      <HeaderEntry label="Title">{header.title}</HeaderEntry>
      <HeaderEntry label="Maker Code">{header.makerCode}</HeaderEntry>
      <HeaderEntry label="Game Code">{header.gameCode}</HeaderEntry>
      <HeaderEntry label="Destination">
        {header.destination || "Unknown"}
      </HeaderEntry>
      <HeaderDivider>Hardware</HeaderDivider>
      <HeaderEntry label="ROM Size">{asBytes(header.romSize)}</HeaderEntry>
      <HeaderEntry label="RAM Size">{asBytes(header.ramSize)}</HeaderEntry>
    </Box>
  );
}
