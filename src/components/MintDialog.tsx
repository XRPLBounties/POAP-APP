import React from "react";
import { useAtom } from "jotai";
import type { ReactNode } from "react";
import { useSnackbar } from "notistack";

import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";

import API from "apis";
import { useWeb3 } from "connectors/context";
import { activeDialogAtom } from "states/atoms";
import { DialogIdentifier } from "types";

type MintDialogContent = {
  title: string;
  description: string;
  location: string;
  url: string;
  tokenCount: string;
};

const DEFAULT_CONTENT = {
  title: "",
  description: "",
  location: "",
  url: "",
  tokenCount: "",
};

type MintDialogProps = {
  children?: ReactNode;
};

function MintDialog(props: MintDialogProps) {
  const { account } = useWeb3();
  const [open, setOpen] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [content, setContent] =
    React.useState<MintDialogContent>(DEFAULT_CONTENT);
  const [activeDialog, setActiveDialog] = useAtom(activeDialogAtom);
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    setOpen(activeDialog.type === DialogIdentifier.DIALOG_MINT);
  }, [activeDialog]);

  const handleClose = (event: {}, reason?: string) => {
    if (reason === "backdropClick") {
      return;
    }
    setActiveDialog({});
  };

  const handleCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
    setContent(DEFAULT_CONTENT);
    setActiveDialog({});
  };

  const handleConfirm = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setLoading(true);
    try {
      if (account) {
        const result = await API.mint({
          walletAddress: account,
          title: content.title,
          desc: content.description,
          loc: content.location,
          url: content.url,
          tokenCount: parseInt(content.tokenCount),
        });
        console.debug("MintResult", result);
        enqueueSnackbar(`Mint successful: Event ID #${result.eventId}`, {
          variant: "success",
        });
      }
    } catch (error) {
      console.debug(error);
      enqueueSnackbar(`Mint failed: ${(error as Error).message}`, {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
    setContent(DEFAULT_CONTENT);
    setActiveDialog({});
  };

  const validateChange = (text: string, name: string): boolean => {
    if (text === "") {
      return true;
    }

    if (name === "tokenCount") {
      return parseInt(text) > 0;
    } else {
      return true;
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    const name = event.target.name;
    if (validateChange(value, name)) {
      setContent({ ...content, [name]: value });
    }
  };

  // TODO better validation, for each input separately
  const validateContent = React.useCallback(() => {
    if (content.title.length === 0) {
      return false;
    }
    if (content.description.length === 0) {
      return false;
    }
    if (content.location.length === 0) {
      return false;
    }
    if (content.url.length === 0) {
      // TODO regexp match
      return false;
    }
    if (!(parseInt(content.tokenCount) > 0)) {
      return false;
    }
    return true;
  }, [content]);

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
        Create new Event
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
        size="small"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      <DialogContent>
        <Stack direction="column" spacing={2}>
          <TextField
            name="title"
            label="Title"
            type="string"
            value={content.title}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <TextField
            name="description"
            label="Description"
            type="string"
            value={content.description}
            onChange={handleChange}
            disabled={loading}
            required
            multiline
            rows={4}
          />
          <TextField
            name="location"
            label="Location"
            type="string"
            value={content.location}
            onChange={handleChange}
            disabled={loading}
            required
            multiline
            rows={2}
          />
          <TextField
            name="url"
            label="Image URL"
            type="url"
            value={content.url}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <TextField
            name="tokenCount"
            label="Token Count"
            type="number"
            value={content.tokenCount}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleConfirm}
          startIcon={loading && <CircularProgress size={20} />}
          disabled={loading || !Boolean(account) || !validateContent()}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MintDialog;
