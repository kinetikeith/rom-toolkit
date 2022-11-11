import { useState } from "react";

import HexField from "../component/HexField";
import EditDialog, { ValueDialogProps } from "./EditDialog";

interface HexDialogProps extends ValueDialogProps<number> {
  nChars: number;
}

export default function HexDialog(props: HexDialogProps) {
  const [value, setValue] = useState<number>(props.value);

  const onUpdate = (value: number) => {
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
      <HexField
        value={props.value}
        onUpdate={onUpdate}
        valid={true}
        nChars={props.nChars}
      />
    </EditDialog>
  );
}
