import { Outlet } from "react-router-dom";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

function BasicLayout(props: any) {
  return (
    <Box>
      <Box component="main" sx={{ position: "relative", minHeight: "100vh" }}>
        <Container
          sx={{
            paddingTop: "8.5rem",
            display: "flex",
            justifyContent: "center",
          }}
          maxWidth="md"
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

export default BasicLayout;
