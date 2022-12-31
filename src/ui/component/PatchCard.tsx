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

import { RomContext } from "../../AppData";
import { asBytes, asHexRaw } from "../format";
import IpsPatch from "../../rom/IpsPatch";
import UpsPatch from "../../rom/UpsPatch";
import { TextEntry, DataDivider } from "./data";

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
      <TextEntry label="Blocks" space={5}>
        {props.value.chunks.length}
      </TextEntry>
      <TextEntry label="Begin Address" space={3}>
        {props.value.begin || 0}
      </TextEntry>
      <TextEntry label="End Address" space={3}>
        {props.value.end || 0}
      </TextEntry>
    </>
  );
}

function UpsContent(props: { value: UpsPatch }) {
  const context = useContext(RomContext);

  const success = "success.dark";
  const error = "error.dark";

  const patchCheck = props.value.patchChecksum;
  const isPatchValid = patchCheck === props.value.patchChecksumCalc;

  const inputCheck = props.value.inputChecksum;
  const isInputCheckValid = inputCheck === context.getCrc32();

  const inputSize = props.value.inputSize;
  const isInputSizeValid = inputSize === context.buffer.length;

  return (
    <>
      <DataDivider>Patch File</DataDivider>
      <TextEntry label="Size" space={2}>
        {asBytes(props.value.patchSize)}
      </TextEntry>
      <TextEntry
        label="Checksum"
        space={2}
        color={isPatchValid ? success : error}
      >
        {asHexRaw(props.value.patchChecksum, 8)}
      </TextEntry>
      <TextEntry label="Blocks" space={3}>
        {props.value.chunks.length}
      </TextEntry>
      <DataDivider>Input File</DataDivider>
      <TextEntry
        label="Size"
        space={3}
        color={isInputSizeValid ? success : error}
      >
        {asBytes(props.value.inputSize)}
      </TextEntry>
      <TextEntry
        label="Checksum"
        space={2}
        color={isInputCheckValid ? success : error}
      >
        {asHexRaw(props.value.inputChecksum, 8)}
      </TextEntry>
      <DataDivider>Output File</DataDivider>
      <TextEntry label="Size" space={3}>
        {asBytes(props.value.outputSize)}
      </TextEntry>
      <TextEntry label="Checksum" space={2}>
        {asHexRaw(props.value.outputChecksum, 8)}
      </TextEntry>
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
