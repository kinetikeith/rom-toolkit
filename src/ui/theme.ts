import { createTheme } from "@mui/material/styles";

export const defaultTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#78aba2",
    },
    secondary: {
      main: "#ffe263",
    },
  },
});

export const gbLightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#79b372",
    },
    secondary: {
      main: "#be1959",
    },
    background: {
      default: "#dfdfd1",
    },
  },
});

export const gbaLightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#483c9f",
    },
    secondary: {
      main: "#546f19",
    },
    background: {
      default: "#b3b3b3",
    },
  },
});

export const nesLightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#ff3616",
    },
    secondary: {
      main: "#323232",
    },
    background: {
      default: "#c1c1c1",
    },
  },
});

export const snesLightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#7033cc",
    },
    secondary: {
      main: "#727578",
    },
    background: {
      default: "#f3eeff",
    },
  },
});
