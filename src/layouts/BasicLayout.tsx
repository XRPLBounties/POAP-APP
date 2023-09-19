import { Outlet } from "react-router-dom";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

function BasicLayout() {
  return (
    <Box>
      <Box
        component="main"
        sx={{
          position: "relative",
          minHeight: "100vh",
          backgroundColor: "rgb(252, 252, 252)",
        }}
      >
        <Container maxWidth="sm" disableGutters>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

export default BasicLayout;
