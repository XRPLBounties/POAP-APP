import React from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { useSnackbar } from "notistack";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";

import API from "apis";
import { activeDialogAtom } from "states/atoms";
import { DialogIdentifier } from "types";
import { useAuth } from "components/AuthContext";

type CancelDialogData = Record<string, any>;

function CancelDialog() {
  const { isAuthenticated, jwt, permissions } = useAuth();
  const [open, setOpen] = React.useState<boolean>(false);
  const [data, setData] = React.useState<CancelDialogData | undefined>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [activeDialog, setActiveDialog] = useAtom(activeDialogAtom);
  const { enqueueSnackbar } = useSnackbar();

  const isAuthorized = React.useMemo(() => {
    return (
      isAuthenticated &&
      ["organizer", "admin"].some((x) => permissions.includes(x))
    );
  }, [isAuthenticated, permissions]);

  React.useEffect(() => {
    setOpen(activeDialog.type === DialogIdentifier.DIALOG_CANCEL);
    setData(activeDialog.data);
  }, [activeDialog]);

  const handleClose = (event: {}, reason?: string) => {
    if (reason === "backdropClick") {
      return;
    }
    setData(undefined);
    setActiveDialog({});
  };

  const handleCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
    setData(undefined);
    setActiveDialog({});
  };

  const handleConfirm = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setLoading(true);
    try {
      if (data?.eventId && jwt) {
        const success = await API.event.cancel(jwt, {
          eventId: data.eventId,
        });
        console.debug("result", success);

        if (!success) {
          enqueueSnackbar(`Event cancelation failed`, {
            variant: "error",
          });
        }
      }
    } catch (err) {
      console.debug(err);
      if (axios.isAxiosError(err)) {
        enqueueSnackbar(`Claim failed: ${err.response?.data.error}`, {
          variant: "error",
        });
      } else {
        enqueueSnackbar(`Claim failed: ${(err as Error).message}`, {
          variant: "error",
        });
      }
    } finally {
      setLoading(false);
      setData(undefined);
      setActiveDialog({});
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle
        sx={{
          paddingBottom: 0,
        }}
        variant="h5"
      >
        Cancel Event #{data?.eventId}
      </DialogTitle>
      <IconButton
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
        size="small"
        onClick={handleClose}
        disabled={loading}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      <DialogContent>
        <DialogContentText sx={{ paddingBottom: "0.5rem" }}>
          Are you sure you want to close event #{data?.eventId}?
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button color="primary" onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleConfirm}
          startIcon={loading && <CircularProgress size={20} />}
          disabled={loading || !isAuthorized || !data?.eventId}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CancelDialog;
