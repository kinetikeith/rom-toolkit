import { useContext, useCallback } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import { PatchContext } from "../../AppData";
import { useUploads } from "../../file";

import PatchCard from "../component/PatchCard";

const patchExts = [".ips", ".ups"];

export default function PatchEditor(props: {}) {
  const context = useContext(PatchContext);

  const onUploads = useCallback(
    (files: File[]) => {
      files.forEach((file) => context.add(file));
    },
    [context]
  );

  const triggerUpload = useUploads(onUploads, patchExts);

  return (
    <>
      <Stack spacing={2}>
        {context.files.map((file, index) => (
          <PatchCard
            value={file}
            key={index}
            onRemove={() => context.remove(file)}
          />
        ))}
        <Button variant="contained" color="secondary" onClick={triggerUpload}>
          Open Patch
        </Button>
      </Stack>
    </>
  );
}
