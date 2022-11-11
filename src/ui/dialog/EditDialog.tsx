import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

export interface ValueDialogProps<T> {
  open: boolean;
  value: T;
  title?: string;
  onSubmit: (value: T) => any;
  onCancel: () => any;
}

interface EditDialogProps {
  open: boolean;
  title?: string;
  maxWidth?: DialogProps["maxWidth"];
  children: any;
  submitDisabled?: boolean;

  onSubmit?: () => any;
  onCancel?: () => any;
}

export default function EditDialog(props: EditDialogProps) {
  const onSubmit = props.onSubmit || (() => {});
  const onCancel = props.onCancel || (() => {});

  let titleComponent = null;
  if (props.title !== undefined)
    titleComponent = <DialogTitle>{props.title}</DialogTitle>;

  return (
    <Dialog
      open={props.open}
      onClose={() => onCancel()}
      maxWidth={props.maxWidth}
    >
      {titleComponent}
      <DialogContent>{props.children}</DialogContent>
      <DialogActions>
        <Button
          autoFocus
          variant="contained"
          disabled={props.submitDisabled}
          onClick={() => onSubmit()}
        >
          OK
        </Button>
        <Button autoFocus onClick={() => onCancel()}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
