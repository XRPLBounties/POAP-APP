import React from "react";
import { useAtom } from "jotai";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import { activeDialogAtom } from "states/atoms";
import { DialogIdentifier } from "types";
import SummaryStep from "./CreateDialog/SummaryStep";

type LinkDialogData = Record<string, any>;

function LinkDialog() {
  const [open, setOpen] = React.useState<boolean>(false);
  const [data, setData] = React.useState<LinkDialogData>();
  const [actions, setActions] = React.useState<React.ReactNode[]>([]);
  const [activeDialog, setActiveDialog] = useAtom(activeDialogAtom);

  React.useEffect(() => {
    setOpen(activeDialog.type === DialogIdentifier.DIALOG_LINK);
    setData(activeDialog.data);
  }, [activeDialog]);

  const handleClose = (event: {}, reason?: string) => {
    if (reason === "backdropClick") {
      return;
    }
    setData(undefined);
    setActions([]);
    setActiveDialog({});
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
        <SummaryStep
          active={true}
          loading={false}
          eventId={data?.eventId}
          setLoading={() => {}}
          setEventId={() => {}}
          setError={() => {}}
          setComplete={() => {}}
          setActions={setActions}
        />
      </DialogContent>

      <DialogActions>
        <Button color="primary" onClick={handleClose}>
          Close
        </Button>
        {actions.map((button, index) => (
          <React.Fragment key={index}>{button}</React.Fragment>
        ))}
      </DialogActions>
    </Dialog>
  );
}

export default LinkDialog;
