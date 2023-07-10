import { useContext, useCallback } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { TransitionGroup } from "react-transition-group";
import Collapse from "@mui/material/Collapse";

import { PatchContext } from "../../AppData";
import { useUploads } from "../../file";

import PatchCard from "../component/PatchCard";

const patchExts = [".ips", ".ups", ".bps"];

export default function PatchEditor() {
  const context = useContext(PatchContext);

  const onUploads = useCallback(
    (files: File[]) => {
      files.forEach((file) => context.add(file));
    },
    [context],
  );

  const triggerUpload = useUploads(onUploads, patchExts);

  return (
    <>
      <Stack>
        <List disablePadding>
          <TransitionGroup>
            {[...context.files.entries()].map(([id, file]) => (
              <Collapse key={id}>
                <ListItem disableGutters sx={{ pt: 0, pb: 2 }}>
                  <PatchCard value={file} onRemove={() => context.remove(id)} />
                </ListItem>
              </Collapse>
            ))}
          </TransitionGroup>
        </List>
        <Button variant="contained" color="secondary" onClick={triggerUpload}>
          Open Patch
        </Button>
      </Stack>
    </>
  );
}
