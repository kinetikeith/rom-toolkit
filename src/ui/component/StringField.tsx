import { useState } from "react";

import { FieldProps, InputField } from "./field";

interface StringFieldProps extends FieldProps<string> {
  charset?: string;
  maxLength?: number;
  forceUpper?: boolean;
}

export default function StringField(props: StringFieldProps) {
  const [value, setValue] = useState(props.value);

  const onUpdate = (value: string) => {
    if (props.charset !== undefined) {
      if (![...value].every((char) => props.charset?.includes(char))) return;
    }

    props.onUpdate(value);
    setValue(value);
  };

  return (
    <InputField
      value={value}
      maxLength={props.maxLength}
      onUpdate={onUpdate}
      valid={true}
    />
  );
}
