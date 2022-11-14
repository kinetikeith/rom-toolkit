import { useContext } from "react";

import { useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import { useDownload } from "../file";
import AppContext, { RomType, EditorMode } from "../AppData";
import Navbar from "./Navbar";
import RomOpener from "./RomOpener";
import GbHeaderEditor from "./editor/GbHeaderEditor";
import SnesHeaderEditor from "./editor/SnesHeaderEditor";
import PatchEditor from "./editor/PatchEditor";

class EditorRegistry {
  editors: Map<RomType, Map<EditorMode, any>>;
  constructor() {
    this.editors = new Map();
  }

  register(editor: any, romType: RomType, editorMode: EditorMode) {
    let romCategory = this.editors.get(romType) || new Map();
    romCategory.set(editorMode, editor);
    this.editors.set(romType, romCategory);
  }

  getEditor(romType: RomType, editorMode: EditorMode) {
    const romSpecificEditor = this.editors.get(romType)?.get(editorMode);
    if (romSpecificEditor !== undefined) return romSpecificEditor;
    else return this.editors.get(RomType.Any)?.get(editorMode);
  }
}

const reg = new EditorRegistry();
// Register all the editors
reg.register(GbHeaderEditor, RomType.Gb, EditorMode.Header);
reg.register(SnesHeaderEditor, RomType.Snes, EditorMode.Header);
reg.register(PatchEditor, RomType.Any, EditorMode.Patch);

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

interface AppContentProps {
  fileName: string;
  isModified: boolean;
  resetBuffer: () => any;
}

export default function AppContent(props: AppContentProps) {
  const context = useContext(AppContext);
  const triggerDownload = useDownload(props.fileName, context.buffer);

  let content = null;
  /* Render tab */
  if (context.editorMode === EditorMode.Open) content = <RomOpener />;
  else {
    const Editor = reg.getEditor(context.romType, context.editorMode);
    const saveVariant = props.isModified ? "contained" : "outlined";
    let editorContent = null;
    if (Editor === undefined) {
    } else editorContent = <Editor />;

    content = (
      <>
        <Paper>
          <Navbar mode={context.editorMode} setMode={context.setEditorMode} />
          {editorContent}
        </Paper>
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
