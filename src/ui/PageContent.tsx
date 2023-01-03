import { useContext } from "react";
import { saveAs } from "file-saver";

import { useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";

import { RomContext, FileContext } from "../AppData";
import RomOpener from "./RomOpener";
import GbContent from "./content/GbContent";
import GbaContent from "./content/GbaContent";
import NesContent from "./content/NesContent";
import SnesContent from "./content/SnesContent";
import GenericContent from "./content/GenericContent";

import { RomType } from "../rom/utils";

interface PageContentProps {}

export default function PageContent(props: PageContentProps) {
  const romContext = useContext(RomContext);
  const fileContext = useContext(FileContext);

  let content = null;
  /* Render tab */
  if (fileContext.isOpen) {
    let editorContent = null;
    switch (romContext.type) {
      case RomType.Gb:
        editorContent = <GbContent />;
        break;
      case RomType.Gba:
        editorContent = <GbaContent />;
        break;
      case RomType.Nes:
        editorContent = <NesContent />;
        break;
      case RomType.Snes:
        editorContent = <SnesContent />;
        break;
      case RomType.Generic:
        editorContent = <GenericContent />;
    }

    content = (
      <Fade in={true}>
        <Stack direction="column" spacing={2}>
          <Paper>{editorContent}</Paper>
          <Button
            variant={romContext.isModified ? "contained" : "outlined"}
            onClick={() => {
              fileContext.getEdited().then((file) => {
                saveAs(file);
              });
            }}
          >
            Save
          </Button>
        </Stack>
      </Fade>
    );
  } else content = <RomOpener />;

  return <ContentWrapper>{content}</ContentWrapper>;
}

function ContentWrapper(props: { children: any }) {
  const theme = useTheme();
  const mSize = theme.spacing(3);
  return (
    <Box
      sx={{
        flex: 1,
        p: 3,
        width: "500px",
        maxWidth: "100vw",
        height: 0,
        overflow: "scroll",
        maskImage: `linear-gradient(to bottom, transparent, black ${mSize}, black calc(100% - ${mSize}), transparent)`,
      }}
    >
      {props.children}
    </Box>
  );
}
