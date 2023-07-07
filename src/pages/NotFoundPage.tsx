import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

function NotFoundPage() {
  return (
    <Container maxWidth="sm">
      <Typography
        sx={{
          paddingTop: "10rem",
        }}
        align="center"
        variant="h3"
      >
        404 Not Found!
      </Typography>
    </Container>
  );
}

export default NotFoundPage;
