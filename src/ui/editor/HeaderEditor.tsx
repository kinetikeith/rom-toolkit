import Divider, { DividerProps } from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";

import InfoIcon from "@mui/icons-material/InfoOutlined";
import EditIcon from "@mui/icons-material/Edit";
import ReplayIcon from "@mui/icons-material/Replay";

import { styled } from "@mui/material/styles";

import LabeledValue from "../component/LabeledValue";

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
    <LabeledValue label={props.label} space={9}>
      <>
        {props.children}
        {interactButton}
      </>
    </LabeledValue>
  );
}
