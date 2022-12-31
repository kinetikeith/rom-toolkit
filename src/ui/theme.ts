import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    mono1: React.CSSProperties;
    mono2: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    mono1?: React.CSSProperties;
    mono2?: React.CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    mono1: true;
    mono2: true;
  }
}

const monoFamilies = ['"Roboto Mono"', "monospace"].join(",");

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
  typography: {
    mono1: {
      fontSize: 13,
      fontFamily: monoFamilies,
    },
    mono2: {
      fontSize: 10,
      fontFamily: monoFamilies,
    },
  },
});

export const gbLightTheme = createTheme({
  ...defaultTheme,
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
  ...defaultTheme,
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
  ...defaultTheme,
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
  ...defaultTheme,
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
