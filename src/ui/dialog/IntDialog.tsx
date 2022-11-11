import { useState } from "react";

import IntField from "../component/IntField";
import EditDialog, { ValueDialogProps } from "./EditDialog";

interface IntDialogProps extends ValueDialogProps<number> {
  min?: number;
  max?: number;
}

export default function IntDialog(props: IntDialogProps) {
  const [value, setValue] = useState<number>(props.value);

  let valid = true;
  if (Number.isNaN(value)) valid = false;
  else if (props.min !== undefined && props.min > value) valid = false;
  else if (props.max !== undefined && props.max < value) valid = false;

  const onUpdate = (value: number) => {
    setValue(value);
  };

  return (
    <EditDialog
      {...props}
      submitDisabled={!valid}
      onSubmit={() => {
        props.onSubmit(value);
      }}
      onCancel={() => {
        setValue(props.value); // Reset to original value
        props.onCancel();
      }}
    >
      <IntField value={props.value} onUpdate={onUpdate} valid={valid} />
    </EditDialog>
  );
}
