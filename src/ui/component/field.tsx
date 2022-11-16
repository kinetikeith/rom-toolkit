import { ChangeEvent } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

export interface FieldProps<T> {
  value: T;
  valid: boolean;
  onUpdate: (value: T) => any;
}

interface InputFieldProps extends FieldProps<string> {
  regex?: RegExp;
  maxLength?: number;
  unitStr?: string;
  unitEnd?: boolean;
}

export function InputField(props: InputFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (props.regex !== undefined && !props.regex.test(value)) return;
    if (props.maxLength !== undefined && props.maxLength < value.length) return;
    props.onUpdate(value);
  };

  const fieldColor = props.valid ? "success" : "error";
  let inputProps = {};

  if (props.unitStr !== undefined) {
    if (props.unitEnd) {
      inputProps = {
        endAdornment: (
          <InputAdornment position="end">{props.unitStr}</InputAdornment>
        ),
      };
    } else {
      inputProps = {
        startAdornment: (
          <InputAdornment position="start">{props.unitStr}</InputAdornment>
        ),
      };
    }
  }

  return (
    <TextField
      value={props.value}
      onChange={handleChange}
      color={fieldColor}
      InputProps={inputProps}
    />
  );
}
