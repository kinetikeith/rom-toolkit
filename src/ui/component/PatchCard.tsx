import { useState, useContext, useEffect, useCallback } from "react";

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
import Skeleton from "@mui/material/Skeleton";

import { wrap as comlinkWrap } from "comlink";
import { Buffer } from "buffer";

import { RomContext } from "../../AppData";
import { asBytes, asHexRaw } from "../format";
import { PatchType } from "rommage/BasePatch";
import type {
  PatchInterface,
  PatchInfo,
  IpsPatchInfo,
  UpsPatchInfo,
  BpsPatchInfo,
} from "../../workers/patch";
import PatchWorker from "../../workers/patch?worker";
import { TextEntry, DataDivider } from "./data";

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const success = "success.dark";
const error = "error.dark";

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

function IpsContent(props: { value: IpsPatchInfo }) {
  return (
    <>
      <TextEntry label="Blocks">{props.value.nChunks}</TextEntry>
      <TextEntry label="Begin Address">{props.value.begin || 0}</TextEntry>
      <TextEntry label="End Address">{props.value.end || 0}</TextEntry>
    </>
  );
}

function UpsContent(props: { value: UpsPatchInfo }) {
  const context = useContext(RomContext);

  const isPatchValid =
    props.value.patchChecksum === props.value.patchChecksumCalc;
  const isInputCheckValid = props.value.inputChecksum === context.crc32;
  const isInputSizeValid = props.value.inputSize === context.buffer.length;

  return (
    <>
      <DataDivider>Patch File</DataDivider>
      <TextEntry label="Size">{asBytes(props.value.patchSize)}</TextEntry>
      <TextEntry label="Checksum" color={isPatchValid ? success : error}>
        {asHexRaw(props.value.patchChecksum, 8)}
      </TextEntry>
      <TextEntry label="Blocks">{props.value.nChunks}</TextEntry>
      <DataDivider>Input File</DataDivider>
      <TextEntry label="Size" color={isInputSizeValid ? success : error}>
        {asBytes(props.value.inputSize)}
      </TextEntry>
      <TextEntry label="Checksum" color={isInputCheckValid ? success : error}>
        {asHexRaw(props.value.inputChecksum, 8)}
      </TextEntry>
      <DataDivider>Output File</DataDivider>
      <TextEntry label="Size">{asBytes(props.value.outputSize)}</TextEntry>
      <TextEntry label="Checksum">
        {asHexRaw(props.value.outputChecksum, 8)}
      </TextEntry>
    </>
  );
}

function BpsContent(props: { value: BpsPatchInfo }) {
  const context = useContext(RomContext);

  const isPatchValid =
    props.value.patchChecksum === props.value.patchChecksumCalc;
  const isSourceCheckValid = props.value.sourceChecksum === context.crc32;
  const isSourceSizeValid = props.value.sourceSize === context.buffer.length;

  return (
    <>
      <DataDivider>Patch File</DataDivider>
      <TextEntry label="Size">{asBytes(props.value.patchSize)}</TextEntry>
      <TextEntry label="Checksum" color={isPatchValid ? success : error}>
        {asHexRaw(props.value.patchChecksum, 8)}
      </TextEntry>
      <TextEntry label="Actions">{props.value.nActions}</TextEntry>
      <DataDivider>Input File</DataDivider>
      <TextEntry label="Size" color={isSourceSizeValid ? success : error}>
        {asBytes(props.value.sourceSize)}
      </TextEntry>
      <TextEntry label="Checksum" color={isSourceCheckValid ? success : error}>
        {asHexRaw(props.value.sourceChecksum, 8)}
      </TextEntry>
      <DataDivider>Output File</DataDivider>
      <TextEntry label="Size">{asBytes(props.value.targetSize)}</TextEntry>
      <TextEntry label="Checksum">
        {asHexRaw(props.value.targetChecksum, 8)}
      </TextEntry>
    </>
  );
}

const patchThread = comlinkWrap<PatchInterface>(new PatchWorker());

export default function PatchCard(props: {
  value: File;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [patchInfo, setPatchInfo] = useState<PatchInfo | null>(null);
  const romContext = useContext(RomContext);

  const { value, onRemove } = props;

  useEffect(() => {
    async function updatePatchInfo() {
      const patchBuffer = Buffer.from(await value.arrayBuffer());
      const newPatchInfo = await patchThread.getInfo(patchBuffer);
      setPatchInfo(newPatchInfo);
    }
    updatePatchInfo();
  }, [value]);

  const apply = useCallback(async () => {
    const patchBuffer = Buffer.from(await value.arrayBuffer());
    const newBuffer = await patchThread.apply(romContext.buffer, patchBuffer);
    romContext.updateBuffer(Buffer.from(newBuffer));
    onRemove();
  }, [value, onRemove, romContext]);

  let content = null;
  let typeLabel = "";
  let isKnownFormat = true;
  const loading = patchInfo === null;

  if (!loading) {
    if (patchInfo.type === PatchType.Ips) {
      content = <IpsContent value={patchInfo} />;
      typeLabel = "IPS Patch";
    } else if (patchInfo.type === PatchType.Ups) {
      content = <UpsContent value={patchInfo} />;
      typeLabel = "UPS Patch";
    } else if (patchInfo.type === PatchType.Bps) {
      content = <BpsContent value={patchInfo} />;
      typeLabel = "BPS Patch";
    } else if (patchInfo.type === PatchType.Unknown) {
      typeLabel = "Unknown Format";
      isKnownFormat = false;
    }
  }

  const titleComponent = loading ? <Skeleton>{typeLabel}</Skeleton> : typeLabel;
  const subComponent = loading ? <Skeleton>{value.name}</Skeleton> : value.name;

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardHeader
        title={titleComponent}
        subheader={subComponent}
        action={
          <IconButton onClick={onRemove}>
            <CloseIcon />
          </IconButton>
        }
      />
      <CardActions disableSpacing>
        <Button
          onClick={apply}
          variant="contained"
          disabled={loading || !isKnownFormat}
        >
          Apply
        </Button>
        {content === null ? null : (
          <ExpandMore
            expand={expanded}
            onClick={() => setExpanded((expandedOld) => !expandedOld)}
          >
            <ExpandMoreIcon />
          </ExpandMore>
        )}
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>{content}</CardContent>
      </Collapse>
    </Card>
  );
}
