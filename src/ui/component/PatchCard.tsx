import { useState, useContext } from "react";

import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";

import AppContext from "../../AppData";
import { asBytes, asHex } from "../format";
import IpsPatch from "../../rom/IpsPatch";
import UpsPatch from "../../rom/UpsPatch";
import LabeledValue from "./LabeledValue";

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

function IpsContent(props: { value: IpsPatch }) {
  return (
    <>
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
  const context = useContext(AppContext);

  const success = "success.dark";
  const error = "error.dark";

  const patchCheck = props.value.patchChecksum;
  const isPatchValid = patchCheck === props.value.patchChecksumCalc;

  const inputCheck = props.value.inputChecksum;
  const isInputCheckValid = inputCheck === context.bufferChecksum;

  const inputSize = props.value.inputSize;
  const isInputSizeValid = inputSize === context.buffer.length;

  return (
    <>
      <LabeledValue
        label="Patch Checksum"
        space={2}
        valueColor={isPatchValid ? success : error}
      >
        {asHex(props.value.patchChecksum, 8)}
      </LabeledValue>
      <LabeledValue
        label="Input File Size"
        space={3}
        valueColor={isInputSizeValid ? success : error}
      >
        {asBytes(props.value.inputSize)}
      </LabeledValue>
      <LabeledValue
        label="Input File Checksum"
        space={2}
        valueColor={isInputCheckValid ? success : error}
      >
        {asHex(props.value.inputChecksum, 8)}
      </LabeledValue>
      <LabeledValue label="Output File Size" space={3}>
        {asBytes(props.value.outputSize)}
      </LabeledValue>
      <LabeledValue label="Ouput File Checksum" space={2}>
        {asHex(props.value.outputChecksum, 8)}
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
  onCancel: () => void;
}) {
  const [expanded, setExpanded] = useState<boolean>(false);

  let content = null;
  let typeLabel = "";
  if (props.value instanceof IpsPatch) {
    content = <IpsContent value={props.value} />;
    typeLabel = "IPS Patch";
  } else if (props.value instanceof UpsPatch) {
    content = <UpsContent value={props.value} />;
    typeLabel = "UPS Patch";
  }

  return (
    <Card variant="outlined">
      <CardHeader
        title={typeLabel}
        subheader={props.value.fileName}
        action={
          <IconButton onClick={props.onCancel}>
            <CloseIcon />
          </IconButton>
        }
      />
      <CardActions disableSpacing>
        <Button onClick={props.onApply} variant="contained">
          Apply
        </Button>
        <ExpandMore
          expand={expanded}
          onClick={() => setExpanded((expandedOld) => !expandedOld)}
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>{content}</CardContent>
      </Collapse>
    </Card>
  );
}
