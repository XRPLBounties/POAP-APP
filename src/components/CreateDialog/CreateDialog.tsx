import React from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { useSnackbar } from "notistack";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Typography,
} from "@mui/material";

import Checkbox from "@mui/material/Checkbox";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import API from "apis";
import { useWeb3 } from "connectors/context";
import { activeDialogAtom } from "states/atoms";
import { DialogIdentifier } from "types";
import { useAuth } from "components/AuthContext";
import AuthorizationStep from "./AuthorizationStep";
import CreationStep from "./CreationStep";
import SummaryStep from "./SummaryStep";
import PaymentStep from "./PaymentStep";

enum Steps {
  AUTHORIZATION,
  CREATION,
  PAYMENT,
  SUMMARY,
}

type StepInfo = {
  id: Steps;
  label: string;
  description: string;
};

const stepInfo: StepInfo[] = [
  {
    id: Steps.AUTHORIZATION,
    label: "Authorize Minter",
    description: `For each ad campaign that you create, you can control how much
              you're willing to spend on clicks and conversions, which networks
              and geographical locations you want your ads to show on, and more.`,
  },
  {
    id: Steps.CREATION,
    label: "Create Event",
    description:
      "An ad group contains one or more ads which target a shared set of keywords.",
  },
  {
    id: Steps.PAYMENT,
    label: "Submit Payment",
    description: `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`,
  },
  {
    id: Steps.SUMMARY,
    label: "Summary",
    description: `TODO SHOW QR code and link:
              Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`,
  },
];

// TODO how to solve loading icon ?
// just create react node, easiest ?
// type DialogAction = { label: string; callback: () => void; disabled?: boolean };

type State = {
  loading: boolean;
  activeStep: Steps;
  eventId?: number;
  dialogActions: { [key in Steps]: React.ReactNode[] };
  error: { [key in Steps]: string | null };
  complete: { [key in Steps]: boolean };
};

type Actions = {
  setLoading: (value: boolean) => void;
  setActiveStep: (step: Steps) => void;
  setEventId: (value?: number) => void;
  setError: (step: Steps, text: string | null) => void;
  setComplete: (step: Steps, value: boolean) => void;
  setDialogActions: (step: Steps, actions: React.ReactNode[]) => void;
  reset: () => void;
};

const initialState: State = {
  loading: false,
  activeStep: Steps.AUTHORIZATION,
  eventId: undefined,
  dialogActions: {
    [Steps.AUTHORIZATION]: [],
    [Steps.CREATION]: [],
    [Steps.PAYMENT]: [],
    [Steps.SUMMARY]: [],
  },
  error: {
    [Steps.AUTHORIZATION]: null,
    [Steps.CREATION]: null,
    [Steps.PAYMENT]: null,
    [Steps.SUMMARY]: null,
  },
  complete: {
    [Steps.AUTHORIZATION]: false,
    [Steps.CREATION]: false,
    [Steps.PAYMENT]: false,
    [Steps.SUMMARY]: false,
  },
};

const useStore = create<State & Actions>()((set, get) => ({
  ...initialState,
  setComplete: (step: Steps, value: boolean) => {
    set({ complete: { ...get().complete, [step]: value } });
  },
  setError: (step: Steps, text: string | null) => {
    set({ error: { ...get().error, [step]: text } });
  },
  setLoading: (value: boolean) => {
    set({ loading: value });
  },
  setEventId: (value?: number) => {
    set({ eventId: value });
  },
  setActiveStep: (step: Steps) => {
    set({ activeStep: step });
  },
  setDialogActions: (step: Steps, actions: React.ReactNode[]) => {
    set({ dialogActions: { ...get().dialogActions, [step]: actions } });
  },
  reset: () => {
    set(initialState);
  },
}));

function CreateDialog() {
  const { account, networkId } = useWeb3();
  const { isAuthenticated, jwt, permissions } = useAuth();
  // const [state, dispatch] = React.useReducer<boolean>();
  const state = useStore();
  const [open, setOpen] = React.useState<boolean>(false);
  // const [loading, setLoading] = React.useState<boolean>(false);
  const [activeDialog, setActiveDialog] = useAtom(activeDialogAtom);
  // const [activeStep, setActiveStep] = React.useState(0);
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    setOpen(activeDialog.type === DialogIdentifier.DIALOG_CREATE);
    state.setEventId(activeDialog.data?.eventId);
  }, [activeDialog]);

  // TODO where and how do we reset the state (including step components)
  // might be best, if each component does it themselves

  // update active step
  React.useEffect(() => {
    for (const step of stepInfo) {
      if (!state.complete[step.id]) {
        state.setActiveStep(step.id);
        break;
      }
    }

    // if (!state.complete[Steps.AUTHORIZATION]) {
    //   state.setActiveStep(Steps.AUTHORIZATION);
    //   return;
    // } else if (!state.complete[Steps.CREATION]) {
    //   state.setActiveStep(Steps.CREATION);
    //   return;
    // }
    // TODO reset
    // TODO does this even work (as expected)?
  }, [state.complete]);

  const handleClose = (event?: {}, reason?: string) => {
    if (reason === "backdropClick") {
      return;
    }
    setActiveDialog({});
  };

  const activeStepIndex = React.useMemo(() => {
    return stepInfo.findIndex((x) => x.id === state.activeStep);
  }, [state.activeStep]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle
        sx={{
          paddingBottom: 0,
        }}
        variant="h5"
      >
        Event Creation Setup
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
        disabled={state.loading}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Box
          sx={{
            minWidth: "350px",
            maxWidth: "350px",
            padding: "0 2rem 0 1rem",
          }}
        >
          <Stepper activeStep={activeStepIndex} orientation="vertical">
            {stepInfo.map((step, index) => (
              <Step key={index} completed={state.complete[step.id]}>
                <StepLabel error={!!state.error[step.id]}>
                  {step.label}
                </StepLabel>
                <StepContent>
                  <Typography variant="body2">{step.description}</Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
        {/* TODO loop this ? */}
        <AuthorizationStep
          active={state.activeStep === Steps.AUTHORIZATION}
          loading={state.loading}
          eventId={state.eventId}
          setLoading={state.setLoading}
          setEventId={state.setEventId}
          setError={(text) => state.setError(Steps.AUTHORIZATION, text)}
          setComplete={(value) => state.setComplete(Steps.AUTHORIZATION, value)}
          setActions={(actions) =>
            state.setDialogActions(Steps.AUTHORIZATION, actions)
          }
          close={handleClose}
        />
        <CreationStep
          active={state.activeStep === Steps.CREATION}
          loading={state.loading}
          eventId={state.eventId}
          setLoading={state.setLoading}
          setEventId={state.setEventId}
          setError={(text) => state.setError(Steps.CREATION, text)}
          setComplete={(value) => state.setComplete(Steps.CREATION, value)}
          setActions={(actions) =>
            state.setDialogActions(Steps.CREATION, actions)
          }
          close={handleClose}
        />
        <PaymentStep
          active={state.activeStep === Steps.PAYMENT}
          loading={state.loading}
          eventId={state.eventId}
          setLoading={state.setLoading}
          setEventId={state.setEventId}
          setError={(text) => state.setError(Steps.PAYMENT, text)}
          setComplete={(value) => state.setComplete(Steps.PAYMENT, value)}
          setActions={(actions) =>
            state.setDialogActions(Steps.PAYMENT, actions)
          }
          close={handleClose}
        />
        <SummaryStep
          active={state.activeStep === Steps.SUMMARY}
          loading={state.loading}
          eventId={state.eventId}
          setLoading={state.setLoading}
          setEventId={state.setEventId}
          setError={(text) => state.setError(Steps.SUMMARY, text)}
          setComplete={(value) => state.setComplete(Steps.SUMMARY, value)}
          setActions={(actions) =>
            state.setDialogActions(Steps.SUMMARY, actions)
          }
          close={handleClose}
        />
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleClose}>
          Cancel
        </Button>
        {state.dialogActions[state.activeStep].map((x) => x)}
      </DialogActions>
    </Dialog>
  );
}

export default CreateDialog;
