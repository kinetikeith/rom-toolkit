import { useState } from "react";

import { Navbar, Panel } from "./content";
import PatchEditor from "../editor/PatchEditor";
import InfoDisplay from "../editor/InfoDisplay";

enum Mode {
  Patch,
  Info,
}

const modeLabels = new Map([
  [Mode.Patch, "Patch"],
  [Mode.Info, "Info"],
]);

export default function GenericContent() {
  const [mode, setMode] = useState(Mode.Patch);

  return (
    <>
      <Navbar mode={mode} setMode={setMode} modeLabels={modeLabels} />
      <Panel show={mode === Mode.Patch}>
        <PatchEditor />
      </Panel>
      <Panel show={mode === Mode.Info}>
        <InfoDisplay unmount={mode !== Mode.Info} />
      </Panel>
    </>
  );
}
