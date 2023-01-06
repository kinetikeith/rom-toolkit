import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import GitHubIcon from "@mui/icons-material/GitHub";

import packageInfo from "../../package.json";

export default function PageFooter(props: {}) {
  return (
    <Box p={2} sx={{ textAlign: "center", pt: 3 }}>
      Designed with{" "}
      <Link href="https://reactjs.org" color="secondary">
        React
      </Link>
      <br />
      <GitHubIcon fontSize="inherit" />{" "}
      <Link color="secondary" href={packageInfo.repository.url}>
        GitHub
      </Link>
    </Box>
  );
}
