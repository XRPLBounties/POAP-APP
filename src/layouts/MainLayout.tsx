import { Outlet } from "react-router-dom";
import { useAtomValue } from "jotai";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

import { activeDialogAtom } from "states/atoms";
import { DialogIdentifier } from "types";
import AddDialog from "components/AddDialog";
import ClaimDialog from "components/ClaimDialog";
import Header from "components/Header";
import JoinDialog from "components/JoinDialog";
import LinkDialog from "components/LinkDialog"
import MintDialog from "components/MintDialog";
import ProfileDialog from "components/ProfileDialog";

function MainLayout(props: any) {
  const activeDialog = useAtomValue(activeDialogAtom);

  return (
    <Box>
      <Header />
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
        <AddDialog />
        <ClaimDialog />
        <JoinDialog />
        <LinkDialog />
        <MintDialog />
        {
          // mounted component every time the dialog is opened to ensure
          // the latest values from the database are load
          activeDialog.type === DialogIdentifier.DIALOG_PROFILE && (
            <ProfileDialog />
          )
        }
      </Box>
    </Box>
  );
}

export default MainLayout;
