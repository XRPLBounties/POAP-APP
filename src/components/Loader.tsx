import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

function Loader() {
  return (
    <Box sx={{ display: "block", padding: "1rem 0rem", textAlign: "center" }}>
      <CircularProgress color="primary" />
      <Typography variant="body1">
        Loading
      </Typography>
    </Box>
  );
}

export default Loader;
