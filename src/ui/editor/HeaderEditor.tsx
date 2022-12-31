import Divider, { DividerProps } from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography, { TypographyProps } from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import InfoIcon from "@mui/icons-material/InfoOutlined";
import EditIcon from "@mui/icons-material/Edit";
import ReplayIcon from "@mui/icons-material/Replay";

import { styled } from "@mui/material/styles";

import { DataEntry } from "../component/data";

export const HeaderDivider = styled((props: DividerProps) => (
  <Divider variant="middle" {...props} />
))<DividerProps>(({ theme }) => ({
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  color: theme.palette.text.disabled,
}));

interface HeaderEntryProps {
  label: string;
  onEdit?: () => any;
  onUpdate?: () => any;
  children?: any;
  color?: TypographyProps["color"];
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

  // TODO: possibly move right-side stacking to DataEntry component
  return (
    <DataEntry label={props.label} space={9}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="mono1" color={props.color}>
          {props.children}
        </Typography>
        {interactButton}
      </Stack>
    </DataEntry>
  );
}
