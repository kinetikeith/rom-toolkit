import { useContext } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import AppContext from "../../AppData";
import { useUpload } from "../../file";

export default function PatchEditor(props: {}) {
  const context = useContext(AppContext);

  const triggerUpload = useUpload((file: File) => {}, [".ips", ".ups", ".bps"]);

  return (
    <Box sx={{ p: 2 }}>
      <Button variant="contained" color="secondary" onClick={triggerUpload}>
        Open Patch
      </Button>
    </Box>
  );
}
