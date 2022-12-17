import { useState } from "react";

import { Navbar, Panel } from "./content";
import NesHeaderEditor from "../editor/NesHeaderEditor";
import PatchEditor from "../editor/PatchEditor";

enum Mode {
  Header,
  Patch,
}

const modeLabels = new Map([
  [Mode.Header, "Header"],
  [Mode.Patch, "Patch"],
]);

export default function NesContent(props: {}) {
  const [mode, setMode] = useState(Mode.Header);

  return (
    <>
      <Navbar mode={mode} setMode={setMode} modeLabels={modeLabels} />
      <Panel show={mode === Mode.Header}>
        <NesHeaderEditor />
      </Panel>
      <Panel show={mode === Mode.Patch}>
        <PatchEditor />
      </Panel>
    </>
  );
}
