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
      main: "#fe7512",
    },
    secondary: {
      main: "#577873",
    },
    background: {
      default: "#e8ecee",
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
      main: "#5a9354",
    },
    secondary: {
      main: "#be1959",
    },
    background: {
      default: "#e5e5da",
    },
  },
});

export const gbaLightTheme = createTheme({
  ...defaultTheme,
  palette: {
    mode: "light",
    primary: {
      main: "#6e3ac9",
    },
    secondary: {
      main: "#617687",
    },
    background: {
      default: "#e1e7ea",
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
      main: "#474646",
    },
    background: {
      default: "#dbdbdb",
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
      main: "#555b60",
    },
    background: {
      default: "#f3eeff",
    },
  },
});
