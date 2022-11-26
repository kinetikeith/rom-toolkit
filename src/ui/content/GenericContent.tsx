import { useState } from "react";

import { Navbar, Panel } from "./content";
import PatchEditor from "../editor/PatchEditor";

enum Mode {
  Patch,
}

const modeLabels = new Map([[Mode.Patch, "Patch"]]);

export default function GenericContent(props: {}) {
  const [mode, setMode] = useState(Mode.Patch);

  return (
    <>
      <Navbar mode={mode} setMode={setMode} modeLabels={modeLabels} />
      <Panel show={mode === Mode.Patch}>
        <PatchEditor />
      </Panel>
    </>
  );
}
