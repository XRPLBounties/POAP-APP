import { Outlet } from "react-router-dom";
import { useAtomValue } from "jotai";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

import { activeDialogAtom } from "states/atoms";
import { DialogIdentifier } from "types";
import Header from "components/Header";
import AddDialog from "components/AddDialog";
import CancelDialog from "components/CancelDialog";
import ClaimDialog from "components/ClaimDialog";
import CreateDialog from "components/CreateDialog";
import JoinDialog from "components/JoinDialog";
import LinkDialog from "components/LinkDialog";
import ProfileDialog from "components/ProfileDialog";

function MainLayout(props: any) {
  const activeDialog = useAtomValue(activeDialogAtom);

  return (
    <Box>
      <Header />
      <Box
        component="main"
        sx={{
          position: "relative",
          minHeight: "100vh",
          backgroundColor: "rgb(252, 252, 252)",
        }}
      >
        <Container
          sx={{
            paddingTop: "8.5rem",
            display: "flex",
            justifyContent: "center",
          }}
          maxWidth="lg"
        >
          <Outlet />
        </Container>
        <AddDialog />
        <CancelDialog />
        <ClaimDialog />
        <CreateDialog />
        <JoinDialog />
        <LinkDialog />
        {
          // mount component every time the dialog is opened to ensure
          // the latest values from the database are loaded
          activeDialog.type === DialogIdentifier.DIALOG_PROFILE && (
            <ProfileDialog />
          )
        }
      </Box>
    </Box>
  );
}

export default MainLayout;
