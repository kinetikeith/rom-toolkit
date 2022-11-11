import { useState } from "react";

import { InputField, FieldProps } from "./Field";
import { asHexRaw } from "../format";

interface HexFieldProps extends FieldProps<number> {
  nChars: number;
}

export default function HexField(props: HexFieldProps) {
  const [strValue, setStrValue] = useState<string>(asHexRaw(props.value) || "");
  const valid =
    !Number.isNaN(props.value) && props.valid && strValue.length > 0;

  const onUpdate = (strValue: string) => {
    const value = Number.parseInt(strValue, 16);
    props.onUpdate(value);
    setStrValue(strValue);
  };

  return (
    <InputField
      regex={/^[0-9a-fA-F]*$/}
      value={strValue || ""}
      valid={valid}
      maxLength={props.nChars}
      unitStr="0x"
      onUpdate={onUpdate}
    />
  );
}
