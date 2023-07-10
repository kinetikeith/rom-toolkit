import { useState, useContext, useCallback } from "react";

import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import FileOpenOutlinedIcon from "@mui/icons-material/FileOpenOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import Fade from "@mui/material/Fade";

import { FileContext } from "../AppData";
import { useUpload } from "../file";

const romExts = [".gb", ".gbc", ".gba", ".nes", ".sfc", ".zip"];

export default function RomOpener() {
  const context = useContext(FileContext);
  const [loading, setLoading] = useState<boolean>(false);
  const onUpload = useCallback(
    (file: File) => {
      setLoading(true);
      context.setOpened(file).then(() => {
        setLoading(false);
      });
    },
    [context],
  );

  const clickFunc = useUpload(onUpload, romExts);

  return (
    <Fade in={!loading}>
      <Paper sx={{ p: 5 }}>
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <FileOpenOutlinedIcon sx={{ fontSize: 40 }} />
          <Box sx={{ position: "relative" }}>
            <Button
              onClick={clickFunc}
              variant="contained"
              component="label"
              size="large"
              disabled={loading}
            >
              Open Rom
            </Button>
            {loading ? (
              <CircularProgress
                size={24}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  marginTop: "-12px",
                  marginLeft: "-12px",
                }}
              />
            ) : null}
          </Box>
        </Stack>
      </Paper>
    </Fade>
  );
}
