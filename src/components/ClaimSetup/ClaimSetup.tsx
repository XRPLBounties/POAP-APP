import React from "react";
import { useAtom } from "jotai";
import { create } from "zustand";
import { isMobile } from "react-device-detect";

import { Alert, Box, Collapse, Step, StepLabel, Stepper } from "@mui/material";

import { useAuth } from "components/AuthContext";
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
    label: "Connect Wallet",
  },
  {
    id: Steps.CLAIM,
    label: "Claim NFT",
  },
  {
    id: Steps.SUMMARY,
    label: "Finished",
  },
];

function ClaimSetup() {
  const state = useStore();
  const { isAuto, toggleAuto, setClaimFlow } = useAuth();
  const [selectedWallet, setSelectedWallet] = useAtom(selectedWalletAtom);

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
          state.setError(Steps.CONNECT, null);
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
    if (params.get("access_token")) {
      load();
    }

    return () => {
      mounted = false;
    };
  }, []);

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
        <Alert severity="error">{state.error[state.activeStep]}</Alert>
      </Collapse>

      <Box
        sx={{
          paddingTop: "2rem",
        }}
      >
        <ConnectStep {...createStepFields(state, Steps.CONNECT)} />
        <ClaimStep {...createStepFields(state, Steps.CLAIM)} />
        <SummaryStep {...createStepFields(state, Steps.SUMMARY)} />
        <Stepper activeStep={activeStepIndex}>
          {stepInfo.map((step, index) => (
            <Step key={index} completed={state.complete[step.id]}>
              <StepLabel error={!!state.error[step.id]}>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </Box>
  );
}

export default ClaimSetup;
