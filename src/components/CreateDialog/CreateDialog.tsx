import React from "react";
import { useAtom } from "jotai";
import { create } from "zustand";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { activeDialogAtom } from "states/atoms";
import { DialogIdentifier } from "types";
import AuthorizationStep from "./AuthorizationStep";
import RegistrationStep from "./RegistrationStep";
import SummaryStep from "./SummaryStep";
import PaymentStep from "./PaymentStep";

enum Steps {
  UNKNOWN,
  AUTHORIZATION,
  REGISTRATION,
  PAYMENT,
  SUMMARY,
}

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
  activeStep: Steps.UNKNOWN,
  eventId: undefined,
  dialogActions: {
    [Steps.UNKNOWN]: [],
    [Steps.AUTHORIZATION]: [],
    [Steps.REGISTRATION]: [],
    [Steps.PAYMENT]: [],
    [Steps.SUMMARY]: [],
  },
  error: {
    [Steps.UNKNOWN]: null,
    [Steps.AUTHORIZATION]: null,
    [Steps.REGISTRATION]: null,
    [Steps.PAYMENT]: null,
    [Steps.SUMMARY]: null,
  },
  complete: {
    [Steps.UNKNOWN]: true,
    [Steps.AUTHORIZATION]: false,
    [Steps.REGISTRATION]: false,
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

type StepInfo = {
  id: Steps;
  label: string;
  description: React.ReactNode;
};

const stepInfo: StepInfo[] = [
  {
    id: Steps.AUTHORIZATION,
    label: "Authorize Minter",
    description: "Set the platform wallet address as your authorized minter.",
  },
  {
    id: Steps.REGISTRATION,
    label: "Register Event",
    description: `Provide the event details. Information is stored on-chain 
      and cannot be modified once submitted.`,
  },
  {
    id: Steps.PAYMENT,
    label: "Submit Payment",
    description: `Transfer the event deposit to cover reserve requirements and transaction fees.
      The deposit will be refunded once the event has ended.`,
  },
  {
    id: Steps.SUMMARY,
    label: "Summary",
    description: "Share the provided link to invite participants to the event.",
  },
];

function CreateDialog() {
  const state = useStore();
  const [open, setOpen] = React.useState<boolean>(false);
  const [activeDialog, setActiveDialog] = useAtom(activeDialogAtom);

  React.useEffect(() => {
    setOpen(activeDialog.type === DialogIdentifier.DIALOG_CREATE);
    state.setEventId(activeDialog.data?.eventId);
  }, [activeDialog]);

  // update active step
  React.useEffect(() => {
    for (const step of stepInfo) {
      if (!state.complete[step.id]) {
        state.setActiveStep(step.id);
        break;
      }
    }
  }, [state.complete]);

  const handleClose = (event?: {}, reason?: string) => {
    if (reason === "backdropClick") {
      return;
    }
    setActiveDialog({});
    state.reset();
  };

  const activeStepIndex = React.useMemo(() => {
    return stepInfo.findIndex((x) => x.id === state.activeStep);
  }, [state.activeStep]);

  const createStepFields = (state: State & Actions, step: Steps) => ({
    active: state.activeStep === step,
    loading: state.loading,
    eventId: state.eventId,
    setLoading: state.setLoading,
    setEventId: state.setEventId,
    setError: (text: string | null) => state.setError(step, text),
    setComplete: (value: boolean) => state.setComplete(step, value),
    setActions: (actions: React.ReactNode[]) =>
      state.setDialogActions(step, actions),
  });

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
        <Grid container>
          <Grid item xs={5}>
            <Box
              sx={{
                paddingLeft: "1rem",
                paddingRight: "2rem",
              }}
            >
              <Stepper activeStep={activeStepIndex} orientation="vertical">
                {stepInfo.map((step, index) => (
                  <Step key={index} completed={state.complete[step.id]}>
                    <StepLabel error={!!state.error[step.id]}>
                      {step.label}
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2">
                        {step.description}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Grid>
          <Grid item xs={7}>
            <AuthorizationStep
              {...createStepFields(state, Steps.AUTHORIZATION)}
            />
            <RegistrationStep
              {...createStepFields(state, Steps.REGISTRATION)}
            />
            <PaymentStep {...createStepFields(state, Steps.PAYMENT)} />
            <SummaryStep {...createStepFields(state, Steps.SUMMARY)} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleClose}>
          {state.activeStep === Steps.SUMMARY ? "Close" : "Cancel"}
        </Button>
        {state.dialogActions[state.activeStep].map((button, index) => (
          <React.Fragment key={index}>{button}</React.Fragment>
        ))}
      </DialogActions>
    </Dialog>
  );
}

export default CreateDialog;
