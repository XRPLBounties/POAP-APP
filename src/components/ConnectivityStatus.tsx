import React from "react";

import Alert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";

import API from "apis";

function ConnectivityStatus() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    // TODO does the mounted value actually change ?
    const check = async () => {
      try {
        await API.auth.heartbeat();
        if (mounted) {
          setOpen(false);
        }
      } catch (error) {
        if (mounted) {
          setOpen(true);
        }
      }
    };

    const interval = setInterval(check, 30 * 1000);

    check();

    // clear interval to prevent memory leaks when unmounting
    return () => {
      clearInterval(interval);
      mounted = false;
    };
  }, []);

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
