import { useState } from "react";

import { Navbar, Panel } from "./content";
import NesHeaderEditor from "../editor/NesHeaderEditor";
import PatchEditor from "../editor/PatchEditor";
import InfoDisplay from "../editor/InfoDisplay";

enum Mode {
  Header,
  Patch,
  Info,
}

const modeLabels = new Map([
  [Mode.Header, "Header"],
  [Mode.Patch, "Patch"],
  [Mode.Info, "Info"],
]);

export default function NesContent() {
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
      <Panel show={mode === Mode.Info}>
        <InfoDisplay unmount={mode !== Mode.Info} />
      </Panel>
    </>
  );
}
