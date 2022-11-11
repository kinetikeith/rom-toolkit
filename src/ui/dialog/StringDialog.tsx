import { useState } from "react";

import StringField from "../component/StringField";
import EditDialog, { ValueDialogProps } from "./EditDialog";

interface StringDialogProps extends ValueDialogProps<string> {
  value: string;
  maxLength?: number;
}

export default function StringDialog(props: StringDialogProps) {
  const [value, setValue] = useState<string>(props.value);

  const onUpdate = (value: string) => {
    setValue(value);
  };

  return (
    <EditDialog
      {...props}
      onSubmit={() => {
        props.onSubmit(value);
      }}
      onCancel={() => {
        setValue(props.value);
        props.onCancel();
      }}
    >
      <StringField
        value={props.value}
        onUpdate={onUpdate}
        valid={true}
        maxLength={props.maxLength}
      />
    </EditDialog>
  );
}
