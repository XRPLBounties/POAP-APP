import React from "react";
import { useParams } from "react-router-dom";
import { useAtom } from "jotai";
import { create } from "zustand";
import { isMobile } from "react-device-detect";

import {
  Alert,
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Step,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";

import { useAuth } from "components/AuthContext";
import { useWeb3 } from "connectors/context";
import { selectedWalletAtom } from "states/atoms";
import { xumm } from "connectors/xumm";
import { getConnector } from "connectors";
import type { Connector } from "connectors/connector";
import { ConnectorType } from "types";

import ClaimStep from "./ClaimStep";
import SummaryStep from "./SummaryStep";
import ConnectStep from "./ConnectStep";

enum Steps {
  UNKNOWN,
  CONNECT,
  CLAIM,
  SUMMARY,
}

type State = {
  loading: boolean;
  activeStep: Steps;
  maskedEventId?: string;
  error: { [key in Steps]: string | null };
  complete: { [key in Steps]: boolean };
};

type Actions = {
  setLoading: (value: boolean) => void;
  setActiveStep: (step: Steps) => void;
  setMaskedEventId: (value?: string) => void;
  setError: (step: Steps, text: string | null) => void;
  setComplete: (step: Steps, value: boolean) => void;
  reset: () => void;
};

const initialState: State = {
  loading: false,
  activeStep: Steps.UNKNOWN,
  maskedEventId: undefined,
  error: {
    [Steps.UNKNOWN]: null,
    [Steps.CONNECT]: null,
    [Steps.CLAIM]: null,
    [Steps.SUMMARY]: null,
  },
  complete: {
    [Steps.UNKNOWN]: true,
    [Steps.CONNECT]: false,
    [Steps.CLAIM]: false,
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
  setMaskedEventId: (value?: string) => {
    set({ maskedEventId: value });
  },
  setActiveStep: (step: Steps) => {
    set({ activeStep: step });
  },
  reset: () => {
    set(initialState);
  },
}));

type StepInfo = {
  id: Steps;
  label: string;
};

const stepInfo: StepInfo[] = [
  {
    id: Steps.CONNECT,
    label: "Connect",
  },
  {
    id: Steps.CLAIM,
    label: "Claim",
  },
  {
    id: Steps.SUMMARY,
    label: "Finish",
  },
];

function ClaimSetup() {
  const state = useStore();
  const { connector, isActive } = useWeb3();
  const { isAuto, toggleAuto } = useAuth();
  const [selectedWallet, setSelectedWallet] = useAtom(selectedWalletAtom);
  const [openDialog, setOpenDialog] = React.useState<boolean>(false);

  const { id } = useParams();

  // force enable auto login
  React.useEffect(() => {
    if (!isAuto) {
      toggleAuto();
    }
  }, [isAuto, toggleAuto]);

  // eagerly connect (refresh)
  React.useEffect(() => {
    let selectedConnector: Connector | undefined;
    if (selectedWallet) {
      try {
        selectedConnector = getConnector(selectedWallet as ConnectorType);
      } catch {
        setSelectedWallet(ConnectorType.EMPTY);
      }
    }

    if (selectedConnector && !selectedConnector.state.isActive()) {
      if (selectedConnector.getType() === ConnectorType.XUMM) {
        selectedConnector.activate();
      }
    }
  }, [selectedWallet, setSelectedWallet]);

  // eagerly connect (deeplink redirect)
  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        await xumm.activate();
        if (mounted) {
          setSelectedWallet(ConnectorType.XUMM);
        }
      } catch (err) {
        console.log(err);
        if (mounted) {
          state.setError(
            Steps.CONNECT,
            `Failed to connect wallet (redirect): ${(err as Error).message}`
          );
        }
      }
    };

    const params = new URLSearchParams(document?.location?.search || "");
    if (params.get("access_token") || params.get("connect")) {
      load();
    }

    return () => {
      mounted = false;
    };
  }, []);

  const handleCloseDialog = React.useCallback(
    (event: {}, reason?: string) => {
      if (reason === "backdropClick") {
        return;
      }
      setOpenDialog(false);
    },
    [setOpenDialog]
  );

  const handleDisconnect = React.useCallback(async () => {
    try {
      if (connector?.deactivate) {
        await connector.deactivate();
      } else {
        await connector?.reset();
      }
      setSelectedWallet(ConnectorType.EMPTY);
      state.reset();
    } catch (err) {
      console.debug(err);
      state.setError(
        Steps.CONNECT,
        `Failed to disconnect wallet: ${(err as Error).message}`
      );
    }
  }, [connector, setSelectedWallet, state.reset]);

  // update active step
  React.useEffect(() => {
    for (const step of stepInfo) {
      if (!state.complete[step.id]) {
        state.setActiveStep(step.id);
        break;
      }
    }
  }, [state.complete]);

  const createStepFields = (state: State & Actions, step: Steps) => ({
    active: state.activeStep === step,
    loading: state.loading,
    setLoading: state.setLoading,
    setError: (text: string | null) => state.setError(step, text),
    setComplete: (value: boolean) => state.setComplete(step, value),
  });

  const activeStepIndex = React.useMemo(() => {
    return stepInfo.findIndex((x) => x.id === state.activeStep);
  }, [state.activeStep]);

  return (
    <Box>
      <Collapse in={!!state.error[state.activeStep]}>
        <Alert sx={{ borderRadius: 0 }} severity="error">
          {state.error[state.activeStep]}
        </Alert>
      </Collapse>

      <Box
        sx={{
          position: "relative",
          padding: "2rem 1rem",
        }}
      >
        {[Steps.CLAIM, Steps.SUMMARY].includes(state.activeStep) && (
          <Tooltip title="Change your wallet">
            <IconButton
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
              size="small"
              onClick={() => setOpenDialog(true)}
              disabled={state.loading}
            >
              <ChangeCircleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <Typography
          sx={{
            marginBottom: "0.5rem",
          }}
          align="center"
          variant="h5"
        >
          Claim Your Event NFT
        </Typography>
        <Typography
          sx={{
            marginBottom: "1rem",
          }}
          align="center"
          variant="body2"
          color="grey.400"
        >
          Event ID: {id}
        </Typography>

        <ConnectStep {...createStepFields(state, Steps.CONNECT)} />
        <ClaimStep {...createStepFields(state, Steps.CLAIM)} />
        <SummaryStep {...createStepFields(state, Steps.SUMMARY)} />
      </Box>
      <Stepper
        sx={{
          position: "fixed",
          bottom: "0px",
          right: "0px",
          left: "0px",
          width: "calc(-1rem + 100vw)",
          padding: "1rem",
        }}
        activeStep={activeStepIndex}
      >
        {stepInfo.map((step, index) => (
          <Step key={index} completed={state.complete[step.id]}>
            <StepLabel error={!!state.error[step.id]}>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
      >
        <IconButton
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
          size="small"
          onClick={handleCloseDialog}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <DialogTitle variant="h5">Change wallet</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Disconnecting current wallet. Confirm?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleDisconnect}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ClaimSetup;
