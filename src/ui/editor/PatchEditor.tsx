import { useContext } from "react";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { Buffer } from "buffer";

import AppContext from "../../AppData";
import { useUpload } from "../../file";

import IpsPatch from "../../rom/IpsPatch";

export default function PatchEditor(props: {}) {
  const context = useContext(AppContext);

  const triggerUpload = useUpload(
    (file: File) => {
      file.arrayBuffer().then((arrayBuffer) => {
        const patch = new IpsPatch(Buffer.from(arrayBuffer));

        context.updateBuffer(patch.applyTo(context.buffer));
      });
    },
    [".ips"]
  );

  return (
    <Container>
      <Button variant="contained" color="secondary" onClick={triggerUpload}>
        Open Patch
      </Button>
    </Container>
  );
}
