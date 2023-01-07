import { ReactNode } from "react";
import Typography, { TypographyProps } from "@mui/material/Typography";
import Divider, { DividerProps } from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import { styled } from "@mui/material/styles";

interface DataEntryProps {
  label: string;
  children: ReactNode;
}

interface TextEntryProps extends DataEntryProps {
  children: string | number | null;
  color?: TypographyProps["color"];
  variant?: TypographyProps["variant"];
  width?: number;
}

export const DataDivider = styled((props: DividerProps) => (
  <Divider variant="middle" {...props} />
))<DividerProps>(({ theme }) => ({
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  color: theme.palette.text.disabled,
}));

export function DataEntry(props: DataEntryProps) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ overflow: "clip" }}
    >
      <Typography>{props.label}</Typography>
      <Box sx={{ ml: 2 }}>{props.children}</Box>
    </Stack>
  );
}

export function TextEntry(props: TextEntryProps) {
  /* If children prop is null, render as loading */
  return (
    <DataEntry {...props}>
      <Typography variant={props.variant || "mono1"} color={props.color}>
        {props.children === null ? (
          <Skeleton width={`${props.width || 24}em`} />
        ) : (
          props.children
        )}
      </Typography>
    </DataEntry>
  );
}
