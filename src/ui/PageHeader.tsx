import Box from "@mui/material/Box";
import SvgIcon from "@mui/material/SvgIcon";
import { ReactComponent as Logo } from "./logo.svg";

export default function PageHeader() {
  return (
    <Box p={6}>
      <SvgIcon component={Logo} sx={{ fontSize: 200 }} inheritViewBox />
    </Box>
  );
}
