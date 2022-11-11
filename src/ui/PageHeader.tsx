import Box from "@mui/material/Box";
import MemoryIcon from "@mui/icons-material/Memory";

export default function PageHeader(props: {}) {
  return (
    <Box p={4}>
      <MemoryIcon sx={{ fontSize: 200 }} />
    </Box>
  );
}
