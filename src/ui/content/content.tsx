import { ReactNode } from "react";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

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
    <Container>
      <Tabs
        value={props.mode}
        centered
        onChange={(_event: any, value: T) => {
          props.setMode(value);
        }}
      >
        {[...props.modeLabels].map(([mode, label], index) => (
          <Tab label={label} value={mode} key={index} />
        ))}
      </Tabs>
    </Container>
  );
}
