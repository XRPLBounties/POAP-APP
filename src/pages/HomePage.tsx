import React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import MintDialog from "components/MintDialog";

import { useWeb3 } from "connectors/context";

function HomePage() {
  const { isActive } = useWeb3();
  const [open, setOpen] = React.useState<boolean>(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(true);
  };

  return (
    <React.Fragment>
      <Box sx={{ width: "48rem" }}>
        <Paper
          sx={{ position: "relative", padding: "1.5rem" }}
          elevation={1}
          square
        >
          <Typography sx={{ marginBottom: "20px" }} variant="h5">
            Dashboard
          </Typography>
          {!isActive && (
            <Typography variant="body1">
              Connect a wallet to continue!
            </Typography>
          )}
          <Button
            sx={{ position: "absolute", top: "1rem", right: "1rem" }}
            title="Create a new event"
            color="primary"
            variant="contained"
            onClick={handleClick}
            disabled={!isActive}
          >
            New
          </Button>
        </Paper>
      </Box>
      <MintDialog open={open} setOpen={setOpen} />
    </React.Fragment>
  );
}

export default HomePage;
