import { useState } from "react";

import ChoiceField from "../component/ChoiceField";
import EditDialog, { ValueDialogProps } from "./EditDialog";

interface ChoiceDialogProps<T> extends ValueDialogProps<T> {
  optionMap: Map<T, string>;
  missingLabel?: string;
}

export default function ChoiceDialog<T>(props: ChoiceDialogProps<T>) {
  const [value, setValue] = useState<T>(props.value);

  let valid = true;

  return (
    <EditDialog
      {...props}
      submitDisabled={!valid}
      onSubmit={() => {
        props.onSubmit(value);
      }}
      onCancel={() => {
        setValue(props.value);
        props.onCancel();
      }}
    >
      <ChoiceField
        value={props.value}
        optionMap={props.optionMap}
        missingLabel={props.missingLabel}
        onUpdate={setValue}
        valid={valid}
      />
    </EditDialog>
  );
}
