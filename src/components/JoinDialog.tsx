import React from "react";
import { useAtom } from "jotai";
import type { ReactNode } from "react";
import { useSnackbar } from "notistack";

import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";

import API from "apis";
import { useWeb3 } from "connectors/context";
import { activeDialogAtom } from "states/atoms";
import { DialogIdentifier } from "types";

type JoinDialogProps = {
  children?: ReactNode;
};

type JoinDialogData = Record<string, any>;

function JoinDialog(props: JoinDialogProps) {
  const { provider, account } = useWeb3();
  const [open, setOpen] = React.useState<boolean>(false);
  const [checked, setChecked] = React.useState<boolean>(true);
  const [data, setData] = React.useState<JoinDialogData | undefined>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [activeDialog, setActiveDialog] = useAtom(activeDialogAtom);
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    setOpen(activeDialog.type === DialogIdentifier.DIALOG_JOIN);
    setData(activeDialog.data);
  }, [activeDialog]);

  const handleClose = (event: {}, reason?: string) => {
    if (reason === "backdropClick") {
      return;
    }
    setActiveDialog({});
  };

  const handleCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
    setActiveDialog({});
  };

  const handleConfirm = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setLoading(true);
    try {
      if (provider && account && data?.eventId) {
        const result = await API.event.claim({
          walletAddress: account,
          eventId: data.eventId,
        });
        console.debug("ClaimResult", result);

        // TODO give user better feedback when already joined an event
        if (!result.claimed) {
          if (checked) {
            enqueueSnackbar(
              "Creating NFT claim request: Confirm the transaction in your wallet",
              {
                variant: "warning",
                autoHideDuration: 30000,
              }
            );
            const success = await provider.acceptOffer(result.offerIndex);

            if (success) {
              enqueueSnackbar(`Sign-up successful: Event #${data.eventId}`, {
                variant: "success",
              });
            } else {
              enqueueSnackbar(`Sign-up failed: Unable to claim NFT`, {
                variant: "error",
              });
            }
          }
        } else {
          enqueueSnackbar(`Sign-up successful: Already claimed NFT`, {
            variant: "success",
          });
        }
      }
    } catch (error) {
      console.debug(error);
      enqueueSnackbar(`Sign-up failed: ${(error as Error).message}`, {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }

    setActiveDialog({});
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
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
        Sign up for Event #{data?.eventId}
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
          Would you like to join the event?
        </DialogContentText>
        <DialogContentText sx={{ fontStyle: "italic", fontWeight: "bold" }}>
          "{data?.title}"
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <FormGroup sx={{ marginLeft: "9px", marginRight: "auto" }}>
          <FormControlLabel
            control={<Checkbox checked={checked} onChange={handleChange} />}
            label={
              <Typography color={checked ? "inherit" : "text.secondary"}>
                Immediately claim NFT
              </Typography>
            }
          />
        </FormGroup>
        <Button color="primary" onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleConfirm}
          startIcon={loading && <CircularProgress size={20} />}
          disabled={loading || !Boolean(account)}
        >
          Join
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default JoinDialog;
