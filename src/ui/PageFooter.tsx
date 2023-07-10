import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import GitHubIcon from "@mui/icons-material/GitHub";

export default function PageFooter() {
  return (
    <Box p={2} sx={{ textAlign: "center", pt: 3 }}>
      Designed with{" "}
      <Link href="https://reactjs.org" color="secondary">
        React
      </Link>
      <br />
      <Typography variant="mono2">v{APP_VERSION}</Typography>
      <br />
      <GitHubIcon fontSize="inherit" />{" "}
      <Link color="secondary" href={APP_REPO_URL}>
        GitHub
      </Link>
    </Box>
  );
}
