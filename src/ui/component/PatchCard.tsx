import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { asBytes } from "../format";
import IpsPatch from "../../rom/IpsPatch";
import UpsPatch from "../../rom/UpsPatch";
import LabeledValue from "./LabeledValue";

function IpsContent(props: { value: IpsPatch }) {
  return (
    <>
      <Typography variant="h6">IPS Patch</Typography>
      <LabeledValue label="Name" space={5}>
        {props.value.fileName}
      </LabeledValue>
      <LabeledValue label="Blocks" space={5}>
        {props.value.chunks.length}
      </LabeledValue>
      <LabeledValue label="Begin Address" space={3}>
        {props.value.begin}
      </LabeledValue>
      <LabeledValue label="End Address" space={3}>
        {props.value.end}
      </LabeledValue>
    </>
  );
}

function UpsContent(props: { value: UpsPatch }) {
  return (
    <>
      <Typography variant="h6">UPS Patch</Typography>
      <LabeledValue label="Name" space={5}>
        {props.value.fileName}
      </LabeledValue>
      <LabeledValue label="Input File Size" space={3}>
        {asBytes(props.value.inputSize)}
      </LabeledValue>
      <LabeledValue label="Output File Size" space={3}>
        {asBytes(props.value.outputSize)}
      </LabeledValue>
      <LabeledValue label="Blocks" space={3}>
        {props.value.chunks.length}
      </LabeledValue>
    </>
  );
}

export default function PatchCard(props: {
  value: IpsPatch | UpsPatch;
  onApply: () => void;
}) {
  let content = null;
  if (props.value instanceof IpsPatch)
    content = <IpsContent value={props.value} />;
  else if (props.value instanceof UpsPatch)
    content = <UpsContent value={props.value} />;

  return (
    <Card variant="outlined">
      <CardContent>{content}</CardContent>
      <CardActions>
        <Button onClick={props.onApply} variant="contained">
          Apply
        </Button>
      </CardActions>
    </Card>
  );
}
