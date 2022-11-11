import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider, { DividerProps } from "@mui/material/Divider";
import Box, { BoxProps } from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

import InfoIcon from "@mui/icons-material/InfoOutlined";
import EditIcon from "@mui/icons-material/Edit";
import ReplayIcon from "@mui/icons-material/Replay";

import { styled } from "@mui/material/styles";

const HeaderTypography = styled(Typography)`
  font-family: "Roboto Mono", monospace;
`;

export const HeaderDivider = styled((props: DividerProps) => (
  <Divider variant="middle" {...props} />
))<DividerProps>(({ theme }) => ({
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  color: theme.palette.text.disabled,
}));

const HeaderSpacer = styled((props: BoxProps) => <Box {...props} />)<BoxProps>(
  ({ theme }) => ({
    width: theme.spacing(9),
  })
);

interface HeaderEntryProps {
  label: string;
  onEdit?: () => any;
  onUpdate?: () => any;
  children?: any;
  color?: string;
}

export function HeaderEntry(props: HeaderEntryProps) {
  const editable = props.onEdit !== undefined;
  const updatable = props.onUpdate !== undefined;

  const onInteract = () => {
    if (props.onEdit !== undefined) {
      props.onEdit();
    } else if (props.onUpdate !== undefined) {
      props.onUpdate();
    }
  };

  let InteractIcon = InfoIcon;
  if (editable) InteractIcon = EditIcon;
  else if (updatable) InteractIcon = ReplayIcon;

  const interactButton = (
    <IconButton
      disabled={!(editable || updatable)}
      size="small"
      color="secondary"
      onClick={onInteract}
    >
      <InteractIcon fontSize="inherit" />
    </IconButton>
  );

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <HeaderTypography>{props.label}</HeaderTypography>
      <HeaderSpacer />
      <Stack direction="row" alignItems="center">
        <HeaderTypography color={props.color}>
          {props.children}
        </HeaderTypography>
        {interactButton}
      </Stack>
    </Stack>
  );
}
