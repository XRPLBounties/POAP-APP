import React from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { useSnackbar } from "notistack";
import { QRCodeCanvas } from "qrcode.react";
import { saveAs } from "file-saver";

import {
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import API from "apis";
import { activeDialogAtom } from "states/atoms";
import { DialogIdentifier } from "types";
import { useAuth } from "components/AuthContext";
import Loader from "components/Loader";

type LinkDialogData = Record<string, any>;

function LinkDialog() {
  const { isAuthenticated, jwt, permissions } = useAuth();
  const [open, setOpen] = React.useState<boolean>(false);
  const [data, setData] = React.useState<LinkDialogData>();
  const [link, setLink] = React.useState<string>();
  const [activeDialog, setActiveDialog] = useAtom(activeDialogAtom);
  const { enqueueSnackbar } = useSnackbar();

  const isAuthorized = React.useMemo(() => {
    return isAuthenticated && permissions.includes("organizer");
  }, [isAuthenticated, permissions]);

  React.useEffect(() => {
    setOpen(activeDialog.type === DialogIdentifier.DIALOG_LINK);
    setData(activeDialog.data);
  }, [activeDialog]);

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (jwt && data?.eventId) {
          const masked = await API.event.getLink(jwt, data.eventId);
          if (mounted) {
            setLink(`${window.location.origin}/claim/${masked}`);
          }
        }
      } catch (err) {
        console.debug(err);
        if (mounted) {
          setLink(undefined);
        }
        if (axios.isAxiosError(err)) {
          enqueueSnackbar(
            `Failed to load event link: ${err.response?.data.error}`,
            {
              variant: "error",
            }
          );
        } else {
          enqueueSnackbar("Failed to load event link", {
            variant: "error",
          });
        }
      }
    };

    if (open && data) {
      if (isAuthorized) {
        load();
      } else {
        setLink(undefined);
      }
    }

    return () => {
      mounted = false;
    };
  }, [open, data, jwt, isAuthorized]);

  const handleClose = (event: {}, reason?: string) => {
    if (reason === "backdropClick") {
      return;
    }
    setData(undefined);
    setActiveDialog({});
  };

  const handleConfirm = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setData(undefined);
    setActiveDialog({});
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    const canvas = document.getElementById("qrcode") as HTMLCanvasElement;
    if (canvas) {
      canvas.toBlob((blob) => {
        saveAs(blob!, "qr.png");
      });
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
        Invitation link for Event #{data?.eventId}
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
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      <DialogContent>
        {link ? (
          <React.Fragment>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <QRCodeCanvas
                id="qrcode"
                size={300}
                level="H"
                value={link}
                includeMargin={true}
              />
            </Box>
            <Box
              sx={{
                bgcolor: (theme) => theme.palette.grey[100],
                border: "1px solid",
                borderRadius: "4px",
                borderColor: (theme) => theme.palette.grey[300],
                padding: "0.75rem",
                marginTop: "1rem",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  marginRight: "2rem",
                }}
              >
                {link}
              </Box>
              <Tooltip
                sx={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "50%",
                  transform: "translate(0, -50%)",
                }}
                title="Copy Link"
              >
                <IconButton size="small" onClick={() => handleCopy(link)}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </React.Fragment>
        ) : (
          <Loader text="Fetching link" />
        )}
      </DialogContent>

      <DialogActions>
        <Button color="primary" onClick={handleDownload} disabled={!link}>
          Save QR
        </Button>
        <Button color="primary" onClick={handleConfirm}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default LinkDialog;
