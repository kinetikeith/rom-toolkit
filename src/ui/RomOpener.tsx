import { useState, useContext } from "react";

import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import FileOpenOutlinedIcon from "@mui/icons-material/FileOpenOutlined";
import CircularProgress from "@mui/material/CircularProgress";

import AppContext from "../AppData";
import { useUpload } from "../file";

export default function RomOpener(props: {}) {
  const context = useContext(AppContext);
  const [loading, setLoading] = useState<boolean>(false);
  const triggerUpload = useUpload(
    (file: File) => {
      setLoading(true);
      context.setFile(file).then(() => {
        setLoading(false);
      });
    },
    [".gb", ".gbc", ".gba", ".sfc", ".zip"]
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <FileOpenOutlinedIcon sx={{ fontSize: 40 }} />
        <Box sx={{ position: "relative" }}>
          <Button
            onClick={triggerUpload}
            variant="contained"
            component="label"
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
  );
}
