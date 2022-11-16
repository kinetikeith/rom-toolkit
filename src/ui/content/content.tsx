import { ReactNode } from "react";

import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Divider from "@mui/material/Divider";

export function Panel(props: { show: boolean; children: ReactNode }) {
  return (
    <Box sx={{ p: 2 }} hidden={!props.show}>
      {props.children}
    </Box>
  );
}

interface NavbarProps<T> {
  modeLabels: Map<T, string>;
  mode: T;
  setMode: (mode: T) => void;
}

export function Navbar<T>(props: NavbarProps<T>) {
  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={props.mode}
        centered
        onChange={(event: any, value: T) => {
          props.setMode(value);
        }}
      >
        {[...props.modeLabels].map(([mode, label]) => (
          <Tab label={label} value={mode} key={label} />
        ))}
      </Tabs>
      <Divider variant="middle" />
    </Box>
  );
}
