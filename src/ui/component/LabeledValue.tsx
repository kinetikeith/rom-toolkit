import { ReactNode } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { styled, useTheme } from "@mui/material/styles";

const Monospace = styled(Typography)`
  font-family: "Roboto Mono", monospace;
`;

function Spacer(props: { size?: any }) {
  const theme = useTheme();
  return <Box sx={{ width: theme.spacing(props.size) }} />;
}

interface LabeledValueProps {
  label: string;
  children: ReactNode;
  space: any;
  valueColor?: string;
}

export default function LabeledValue(props: LabeledValueProps) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography>{props.label}</Typography>
      <Spacer size={props.space} />
      <Monospace color={props.valueColor}>{props.children}</Monospace>
    </Stack>
  );
}
