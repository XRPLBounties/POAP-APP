import React from "react";

import Alert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";

import { useAuth } from "components/AuthContext";

function ConnectivityStatus() {
  const { isAvailable } = useAuth();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(!isAvailable);
  }, [isAvailable]);

  return (
    <Collapse in={open}>
      <Alert
        severity="warning"
        action={
          <IconButton
            color="inherit"
            size="small"
            onClick={() => {
              setOpen(false);
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{ "& .MuiAlert-icon": { marginLeft: "auto" } }}
      >
        API backend service is currently unavailable!
      </Alert>
    </Collapse>
  );
}

export default ConnectivityStatus;
