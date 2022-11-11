import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import { useWrap } from "../../wrap";
import EditDialog, { ValueDialogProps } from "./EditDialog";
import GbLogoCanvas from "../component/GbLogoCanvas";
import GbLogo from "../../rom/GbLogo";

interface GbLogoDialogProps extends ValueDialogProps<GbLogo> {}

export default function GbLogoDialog(props: GbLogoDialogProps) {
  const [value, setValue] = useWrap<GbLogo>(props.value.copy());

  const clearLogo = () => {
    value.makeClear();
    setValue();
  };

  const invertLogo = () => {
    value.invert();
    setValue();
  };

  const validLogo = () => {
    value.makeValid();
    setValue();
  };

  return (
    <EditDialog
      {...props}
      maxWidth="lg"
      onSubmit={() => {
        props.onSubmit(value);
      }}
      onCancel={() => {
        setValue(props.value.copy());
        props.onCancel();
      }}
    >
      <Stack>
        <GbLogoCanvas
          logo={value}
          updateLogo={() => {
            setValue();
          }}
        />
        <Stack direction="row">
          <Button onClick={clearLogo}>Clear</Button>
          <Button onClick={invertLogo}>Invert</Button>
          <Button onClick={validLogo}>Set Valid</Button>
        </Stack>
      </Stack>
    </EditDialog>
  );
}
