import { useState } from "react";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import EditDialog, { ValueDialogProps } from "./EditDialog";
import GbLogoCanvas from "../component/GbLogoCanvas";
import GbLogo from "../../rom/GbLogo";

interface GbLogoDialogProps extends ValueDialogProps<GbLogo> {}

export default function GbLogoDialog(props: GbLogoDialogProps) {
  const [value, setValue] = useState<{ logo: GbLogo }>({
    logo: props.value.copy(),
  });

  const updateLogo = (logo?: GbLogo) => {
    if (logo === undefined)
      setValue((oldValue) => ({
        logo: oldValue.logo,
      }));
    else setValue({ logo: logo });
  };

  const clearLogo = () => {
    value.logo.makeClear();
    updateLogo();
  };

  const invertLogo = () => {
    value.logo.invert();
    updateLogo();
  };

  const validLogo = () => {
    value.logo.makeValid();
    updateLogo();
  };

  return (
    <EditDialog
      {...props}
      maxWidth="lg"
      onSubmit={() => {
        props.onSubmit(value.logo);
      }}
      onCancel={() => {
        updateLogo(props.value.copy());
        props.onCancel();
      }}
    >
      <Stack>
        <GbLogoCanvas value={value} updateLogo={updateLogo} />
        <Stack direction="row">
          <Button onClick={clearLogo}>Clear</Button>
          <Button onClick={invertLogo}>Invert</Button>
          <Button onClick={validLogo}>Set Valid</Button>
        </Stack>
      </Stack>
    </EditDialog>
  );
}
