import React from "react";

import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

import { EditorMode } from "../AppData";

interface NavbarProps {
  mode: EditorMode;
  setMode: (mode: EditorMode) => any;
}

export default function Navbar(props: NavbarProps) {
  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={props.mode}
        centered
        onChange={(event: any, value: EditorMode) => {
          props.setMode(value);
        }}
      >
        <Tab label="Header" value={EditorMode.Header} />
        <Tab label="Patch" value={EditorMode.Patch} />
        <Tab label="Info" value={EditorMode.Info} />
      </Tabs>
      <Divider variant="middle" />
    </Box>
  );
}
