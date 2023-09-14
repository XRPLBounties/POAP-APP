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
  const state = useStore();
  const [open, setOpen] = React.useState<boolean>(false);
  const [activeDialog, setActiveDialog] = useAtom(activeDialogAtom);

  React.useEffect(() => {
    setOpen(activeDialog.type === DialogIdentifier.DIALOG_CREATE);
    state.setEventId(activeDialog.data?.eventId);
  }, [activeDialog]);

  // TODO where and how do we reset the state (including step components)
  // might be best, if each component does it themselves

  // update active step
  React.useEffect(() => {
    state.setActiveStep(Steps.SUMMARY);
    return;

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
    // TODO reset dialog (including every step)
    // state.reset();
    // setOpen(false); // doesnt fix strange change while close
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
        <Grid container>
          <Grid item xs={5}>
            <Box
              sx={{
                paddingLeft: "2rem",
                paddingRight: "1rem",
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
              active={state.activeStep === Steps.AUTHORIZATION}
              loading={state.loading}
              eventId={state.eventId}
              setLoading={state.setLoading}
              setEventId={state.setEventId}
              setError={(text) => state.setError(Steps.AUTHORIZATION, text)}
              setComplete={(value) =>
                state.setComplete(Steps.AUTHORIZATION, value)
              }
              setActions={(actions) =>
                state.setDialogActions(Steps.AUTHORIZATION, actions)
              }
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
            />
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
