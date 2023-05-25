import { Outlet } from "react-router-dom";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

import Header from "components/Header";

function MainLayout(props: any) {
  return (
    <Box>
      <Header />
      <Box component="main" sx={{ position: "relative", minHeight: "100vh" }}>
        <Container
          sx={{
            paddingTop: "6rem",
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

export default MainLayout;
