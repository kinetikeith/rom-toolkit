import { ReactNode } from "react";
import Typography, { TypographyProps } from "@mui/material/Typography";
import Divider, { DividerProps } from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { styled, useTheme } from "@mui/material/styles";

interface DataEntryProps {
  label: string;
  children: ReactNode;
  space?: any;
}

interface TextEntryProps extends DataEntryProps {
  children: string | number;
  color?: TypographyProps["color"];
  variant?: TypographyProps["variant"];
}

export const DataDivider = styled((props: DividerProps) => (
  <Divider variant="middle" {...props} />
))<DividerProps>(({ theme }) => ({
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  color: theme.palette.text.disabled,
}));

export function DataEntry(props: DataEntryProps) {
  const theme = useTheme();
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography>{props.label}</Typography>
      <Box sx={{ ml: theme.spacing(props.space || 1) }}>{props.children}</Box>
    </Stack>
  );
}

export function TextEntry(props: TextEntryProps) {
  return (
    <DataEntry {...props}>
      <Typography variant={props.variant || "mono1"} color={props.color}>
        {props.children}
      </Typography>
    </DataEntry>
  );
}
