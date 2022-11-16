import { useState } from "react";

import { FieldProps, InputField } from "./field";

interface IntFieldProps extends FieldProps<number> {}

export default function IntField(props: IntFieldProps) {
  const [strValue, setStrValue] = useState(props.value.toString());
  const valid = !Number.isNaN(props.value) && props.valid;

  const onUpdate = (strValue: string) => {
    const value = Number.parseInt(strValue);
    props.onUpdate(value);
    setStrValue(strValue);
  };

  return (
    <InputField
      regex={/^(\+|-)?(\d*)$/}
      value={strValue}
      valid={valid}
      onUpdate={onUpdate}
    />
  );
}
