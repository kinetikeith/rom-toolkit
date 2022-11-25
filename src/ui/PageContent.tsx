import { useContext } from "react";

import { useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import { useDownload } from "../file";
import AppContext, { RomType, FileState } from "../AppData";
import RomOpener from "./RomOpener";
import GbContent from "./content/GbContent";
import SnesContent from "./content/SnesContent";

interface PageContentProps {
  fileName: string;
  fileState: FileState;
  resetBuffer: () => any;
}

export default function PageContent(props: PageContentProps) {
  const context = useContext(AppContext);
  const triggerDownload = useDownload(props.fileName, context.buffer);

  let content = null;
  /* Render tab */
  if (props.fileState === FileState.Missing) content = <RomOpener />;
  else {
    let editorContent = null;
    if (context.romType === RomType.Generic) editorContent = null;
    switch (context.romType) {
      case RomType.Gb:
        editorContent = <GbContent />;
        break;
      case RomType.Snes:
        editorContent = <SnesContent />;
        break;
    }

    const saveVariant =
      props.fileState === FileState.Modified ? "contained" : "outlined";

    content = (
      <>
        <Paper>{editorContent}</Paper>
        <Button
          variant={saveVariant}
          onClick={() => {
            triggerDownload();
          }}
        >
          Save
        </Button>
      </>
    );
  }

  return (
    <ContentWrapper>
      <Stack direction="column" spacing={2}>
        {content}
      </Stack>
    </ContentWrapper>
  );
}

function ContentWrapper(props: { children: any }) {
  const theme = useTheme();
  const mSize = theme.spacing(3);
  return (
    <Box
      sx={{
        flex: 1,
        p: 3,
        height: 0,
        overflow: "scroll",
        maskImage: `linear-gradient(to bottom, transparent, black ${mSize}, black calc(100% - ${mSize}), transparent)`,
      }}
    >
      {props.children}
    </Box>
  );
}
