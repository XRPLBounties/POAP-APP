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
import { useWeb3 } from "connectors/context";
import { activeDialogAtom } from "states/atoms";
import { DialogIdentifier } from "types";
import { useAuth } from "components/AuthContext";

type ClaimDialogData = Record<string, any>;

function ClaimDialog() {
  const { provider, account } = useWeb3();
  const { isAuthenticated, jwt } = useAuth();
  const [open, setOpen] = React.useState<boolean>(false);
  const [data, setData] = React.useState<ClaimDialogData | undefined>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [activeDialog, setActiveDialog] = useAtom(activeDialogAtom);
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    setOpen(activeDialog.type === DialogIdentifier.DIALOG_CLAIM);
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
      if (provider && account && data?.eventId && jwt) {
        const offer = await API.event.claim(jwt, {
          maskedEventId: data.eventId,
        });
        console.debug("ClaimResult", offer);

        if(!offer) {
          enqueueSnackbar(`Claim failed: User is not a participant`, {
            variant: "error",
          });
          return;
        }

        if (offer.offerIndex && !offer.claimed) {
          enqueueSnackbar(
            "Creating NFT claim request (confirm the transaction in your wallet)",
            {
              variant: "warning",
              autoHideDuration: 30000,
            }
          );
          const success = await provider.acceptOffer(offer.offerIndex);

          if (success) {
            enqueueSnackbar("Claim successful", {
              variant: "success",
            });
          } else {
            enqueueSnackbar(`Claim failed: Unable to claim NFT`, {
              variant: "error",
            });
          }
        } else {
          enqueueSnackbar(`Claim successful: Already claimed NFT`, {
            variant: "success",
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
        Claim NFT for Event #{data?.eventId}
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
          Would you like to claim your NFT now?
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
          disabled={loading || !Boolean(account) || !isAuthenticated}
        >
          Claim
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ClaimDialog;
