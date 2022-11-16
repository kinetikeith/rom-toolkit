import { useContext } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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
        console.log([...patch.chunks]);

        context.updateBuffer(patch.applyTo(context.buffer));
      });
    },
    [".ips"]
  );

  return (
    <Box sx={{ p: 2 }}>
      <Button variant="contained" color="secondary" onClick={triggerUpload}>
        Open Patch
      </Button>
    </Box>
  );
}
