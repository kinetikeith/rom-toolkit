import { useState } from "react";

import { Navbar, Panel } from "./content";
import GbaHeaderEditor from "../editor/GbaHeaderEditor";
import PatchEditor from "../editor/PatchEditor";

enum Mode {
  Header,
  Patch,
}

const modeLabels = new Map([
  [Mode.Header, "Header"],
  [Mode.Patch, "Patch"],
]);

export default function GbaContent(props: {}) {
  const [mode, setMode] = useState(Mode.Header);

  return (
    <>
      <Navbar mode={mode} setMode={setMode} modeLabels={modeLabels} />
      <Panel show={mode === Mode.Header}>
        <GbaHeaderEditor />
      </Panel>
      <Panel show={mode === Mode.Patch}>
        <PatchEditor />
      </Panel>
    </>
  );
}
