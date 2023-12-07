import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

type LoaderProps = {
  text?: string;
};

function Loader(props: LoaderProps) {
  const { text } = props;
  return (
    <Box sx={{ display: "block", padding: "1rem 0rem", textAlign: "center" }}>
      <CircularProgress color="primary" />
      <Typography variant="body1">{text ?? "Loading"}</Typography>
    </Box>
  );
}

export default Loader;
