import { useState } from "react";

import { Panel, Navbar } from "./content";
import SnesHeaderEditor from "../editor/SnesHeaderEditor";
import PatchEditor from "../editor/PatchEditor";

enum Mode {
  Header,
  Patch,
}

const modeLabels = new Map([
  [Mode.Header, "Header"],
  [Mode.Patch, "Patch"],
]);

export default function SnesContent(props: {}) {
  const [mode, setMode] = useState(Mode.Header);

  return (
    <>
      <Navbar mode={mode} setMode={setMode} modeLabels={modeLabels} />
      <Panel show={mode === Mode.Header}>
        <SnesHeaderEditor />
      </Panel>
      <Panel show={mode === Mode.Patch}>
        <PatchEditor />
      </Panel>
    </>
  );
}
