import { useState, ChangeEvent } from "react";

import Switch from "@mui/material/Switch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";

import ChoiceField from "../component/ChoiceField";
import HexField from "../component/HexField";
import StringField from "../component/StringField";
import EditDialog, { ValueDialogProps } from "./EditDialog";
import { licenseeMapOld, licenseeMapNew } from "../../rom/GbHeader";

export interface GbLicensee {
  codeOld: number;
  codeNew: string;
}

interface GbLicenseeDialogProps extends ValueDialogProps<GbLicensee> {
  value: GbLicensee;
}

export default function GbLicenseeDialog(props: GbLicenseeDialogProps) {
  const [value, setValue] = useState<GbLicensee>(props.value);
  const [attemptCustom, setAttemptCustom] = useState<boolean>(false);
  const valid = true;
  const isOld = value.codeOld !== 0x33;

  const handleOld = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) setValue({ codeOld: 0x00, codeNew: "" });
    else setValue({ codeOld: 0x33, codeNew: "00" });
  };

  const handleCustom = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) setAttemptCustom(true);
    else setAttemptCustom(false);
  };

  const isCustom =
    attemptCustom ||
    (isOld
      ? !licenseeMapOld.has(value.codeOld)
      : !licenseeMapNew.has(value.codeNew));

  let choiceComponent = null;
  if (isCustom) {
    if (isOld)
      choiceComponent = (
        <HexField
          value={value.codeOld}
          valid={true}
          nChars={2}
          onUpdate={(value) => {
            setValue({ codeOld: value, codeNew: "00" });
          }}
        />
      );
    else
      choiceComponent = (
        <StringField
          value={value.codeNew}
          valid={true}
          maxLength={2}
          onUpdate={(value) => {
            setValue({ codeOld: 0x33, codeNew: value });
          }}
        />
      );
  } else {
    if (isOld)
      choiceComponent = (
        <ChoiceField
          value={value.codeOld}
          optionMap={licenseeMapOld}
          valid={valid}
          onUpdate={(value) => {
            setValue({ codeOld: value, codeNew: "00" });
          }}
        />
      );
    else
      choiceComponent = (
        <ChoiceField
          value={value.codeNew}
          optionMap={licenseeMapNew}
          valid={valid}
          onUpdate={(value) => {
            setValue({ codeOld: 0x33, codeNew: value });
          }}
        />
      );
  }

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
      <FormGroup>
        <FormControlLabel
          control={<Switch checked={isOld} onChange={handleOld} />}
          label="Use Old Code"
        />
        <FormControlLabel
          control={<Switch checked={attemptCustom} onChange={handleCustom} />}
          label="Custom Value"
        />
      </FormGroup>
      {choiceComponent}
    </EditDialog>
  );
}
