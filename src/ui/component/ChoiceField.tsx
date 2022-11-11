import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

import { FieldProps } from "./Field";

interface ChoiceFieldProps<T> extends FieldProps<T> {
  optionMap: Map<T, string>;
  missingLabel?: string;
}

export default function ChoiceField<T>(props: ChoiceFieldProps<T>) {
  const handleChange = (event: any, newValue: T | null) => {
    if (newValue !== null) props.onUpdate(newValue);
  };

  let displayValue = undefined;
  if (props.optionMap.has(props.value) && props.value !== null)
    displayValue = props.value;

  return (
    <Autocomplete
      autoHighlight
      disableClearable
      value={displayValue}
      options={[...props.optionMap.keys()]}
      getOptionLabel={(option) => props.optionMap.get(option) || ""}
      renderOption={(renderProps: any, option) => (
        <li {...renderProps} key={option}>
          {props.optionMap.get(option)}
        </li>
      )}
      onChange={handleChange}
      sx={{ width: 200 }}
      renderInput={(params) => <TextField {...params} />}
    />
  );
}
