import { useState, useContext } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { Buffer } from "buffer";

import AppContext from "../../AppData";
import { useUploads } from "../../file";
import { Patch, fileToPatch } from "../../rom/utils";

import PatchCard from "../component/PatchCard";

export default function PatchEditor(props: {}) {
  const context = useContext(AppContext);
  const [patches, setPatches] = useState<Array<Patch>>([]);

  const triggerUpload = useUploads(
    (files: File[]) => {
      files.forEach((file, index) => {
        file.arrayBuffer().then((arrayBuffer) => {
          const patch = fileToPatch(Buffer.from(arrayBuffer), file.name);
          if (patch !== undefined) {
            setPatches((patchesOld: Array<Patch>) => {
              const patchesNew = patchesOld.slice(0);
              patchesNew.push(patch);
              return patchesNew;
            });
          }
        });
      });
    },
    [".ips", ".ups"]
  );

  const applyPatch = (index: number) => {
    const patch = patches[index];
    patch.applyTo(context.buffer);
    setPatches((patchesOld) => {
      patchesOld.splice(index, 1);
      return patchesOld.slice(0);
    });
    context.updateBuffer();
  };

  return (
    <>
      <Stack spacing={2}>
        {patches.map((patch, index) => (
          <PatchCard
            value={patch}
            key={index}
            onApply={() => applyPatch(index)}
          />
        ))}
        <Button variant="contained" color="secondary" onClick={triggerUpload}>
          Open Patch
        </Button>
      </Stack>
    </>
  );
}
