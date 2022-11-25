import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import IpsPatch from "../../rom/IpsPatch";
import LabeledValue from "./LabeledValue";

export default function PatchCard(props: {
  value: IpsPatch;
  onApply: () => void;
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">IPS Patch</Typography>
        <LabeledValue label="Name" space={5}>
          {props.value.fileName}
        </LabeledValue>
        <LabeledValue label="Blocks" space={5}>
          {props.value.chunks.length}
        </LabeledValue>
      </CardContent>
      <CardActions>
        <Button onClick={props.onApply} variant="contained">
          Apply
        </Button>
      </CardActions>
    </Card>
  );
}
