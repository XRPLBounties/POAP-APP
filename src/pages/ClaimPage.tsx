import React from "react";
import { useAtom } from "jotai";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAtomValue } from "jotai";
import { useSnackbar } from "notistack";
import { isMobile } from "react-device-detect";

import {
  Alert,
  Box,
  Button,
  Collapse,
  MobileStepper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

import { Offer } from "types";
import { useAuth } from "components/AuthContext";
import { useWeb3 } from "connectors/context";
import API from "apis";
import ContentWrapper from "components/ContentWrapper";

import { selectedWalletAtom } from "states/atoms";
import { shortenAddress } from "utils/strings";
import { xumm } from "connectors/xumm";
import { getConnector } from "connectors";
import type { Connector } from "connectors/connector";
import { ConnectorType } from "types";
import { Debug } from "components/Debug";

// TODO https://m1.material.io/components/steppers.html#steppers-types-of-steps

// TODO remove enqueueSnackbar, use stepper to display errors/problems

type StepState = {
  name: string;
  label: string;
  completed: boolean;
  error?: string;
};

type State = {
  activeStep: string;
  errors: string[];
  completed: boolean[];
};

const steps = ["Connect Wallet", "Claim NFT", "Finished"];

type stepIds = "connect" | "claim" | "finish";

type IStep = {
  id: stepIds;
  label: string;
  node?: React.ReactNode;
};

const steps2: IStep[] = [
  {
    id: "connect",
    label: "Connect Wallet",
  },
  { id: "claim", label: "Claim NFT" },
  { id: "finish", label: "Finished" },
];

type IView = {};

// errors[id] = string | undefined

function ClaimPage() {
  const { connector, provider, account, isActive } = useWeb3();
  const { isAuthenticated, jwt, permissions, isAuto, toggleAuto } = useAuth();
  const [selectedWallet, setSelectedWallet] = useAtom(selectedWalletAtom);
  const [data, setData] = React.useState<Offer | null>();
  const [uuid, setUuid] = React.useState<string>();
  const [errors, setErrors] = React.useState<string[]>(steps.map(() => ""));
  const [completed, setCompleted] = React.useState<string>();
  const [count, setCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const { enqueueSnackbar } = useSnackbar();

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
        // TODO step 0 error
        // if (mounted) {
        //   setErrors()
        // } 
        enqueueSnackbar(
          `Failed to connect wallet (redirect): ${(err as Error).message}`,
          {
            variant: "error",
          }
        );
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

  // fetch claim offer
  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (jwt && id) {
          const offer = await API.event.claim(jwt, {
            maskedEventId: id,
          });

          if (mounted) {
            setData(offer);
          }
        }
      } catch (err) {
        console.debug(err);
        if (mounted) {
          setData(undefined);
        }
        // TODO step 1: erorr
        if (axios.isAxiosError(err)) {
          enqueueSnackbar(
            `Failed to load offer data: ${err.response?.data.error}`,
            {
              variant: "error",
            }
          );
        } else {
          enqueueSnackbar("Failed to load offer data", {
            variant: "error",
          });
        }
      }
    };

    if (isAuthenticated) {
      load();
    } else {
      setData(undefined);
    }

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, jwt, id, count]);

  // TODO update step
  // TODO update completed, error ?
  React.useEffect(() => {
    // setCompleted(step0: isActive)

    // TODO need to check isAuthenticated somewhere and display error if needed

    if (!isActive || !isAuthenticated) {
      // not connected
      setActiveStep(0);
    } else if (!data?.claimed) {
      // nft not claimed
      setActiveStep(1);
    } else {
      setActiveStep(2);
    }
  }, [isActive, isAuthenticated, data]);

  // const findCurrentStep = React.useCallback(async () => {
  //   // connected ?
  //   if (!isActive) {
  //     return 1;
  //   }

  //   // claimed ?
  //   if (!data?.claimed) {
  //     return 2;
  //   }

  //   return 3;
  // }, [isActive]);

  const handleConnect = React.useCallback(async () => {
    // disconnect, if not Xumm
    if (isActive && connector?.getType() !== ConnectorType.XUMM) {
      try {
        if (connector?.deactivate) {
          await connector.deactivate();
        } else {
          await connector?.reset();
        }
        setSelectedWallet(ConnectorType.EMPTY);
      } catch (err) {
        enqueueSnackbar(
          `Failed to disconnect wallet: ${(err as Error).message}`,
          { variant: "error" }
        );
        return;
      }
    }

    setLoading(true);
    try {
      await xumm.activate();
      setSelectedWallet(ConnectorType.XUMM);
    } catch (err) {
      enqueueSnackbar(`Failed to connect wallet: ${(err as Error).message}`, {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [connector, isActive, setSelectedWallet]);

  // TODO make useCallback
  const handleClaim = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setLoading(true);
    try {
      if (provider && account && id && jwt) {
        let offer = data;

        // join event
        if (offer === null) {
          offer = await API.event.join(jwt, {
            maskedEventId: id,
            createOffer: true,
          });
          console.debug("JoinResult", offer);
          enqueueSnackbar(`Sign-up successful: Event #${id}`, {
            variant: "success",
          });
          setData(offer);
        }

        // claim nft
        if (offer?.offerIndex && !offer?.claimed) {
          enqueueSnackbar(
            "Creating NFT claim request (confirm the transaction in your wallet)",
            {
              variant: "warning",
              autoHideDuration: 30000,
            }
          );
          const result = await provider.acceptOffer(offer.offerIndex);

          setUuid(result.uuid);

          const success = await result.resolved;

          if (success) {
            enqueueSnackbar("Claim successful", {
              variant: "success",
            });
            // TODO trigger accepted to reload claim info

            // force reload claim info 
            setCount(count + 1); // TODO use reducer?
            // bad
            // offer.claimed = true;
            // setData(offer);
          } else {
            enqueueSnackbar(`Claim failed: Unable to claim NFT`, {
              variant: "error",
            });
            setUuid(undefined);
          }
        }
      }
    } catch (err) {
      console.debug(err);
      if (axios.isAxiosError(err)) {
        enqueueSnackbar(`Sign-up failed: ${err.response?.data.error}`, {
          variant: "error",
        });
      } else {
        enqueueSnackbar(`Sign-up failed: ${(err as Error).message}`, {
          variant: "error",
        });
      }
    } finally {
      console.log("Finally being called");
      setLoading(false);
      // setData(undefined);
      // setActiveDialog({});
    }
  };

  return (
    <ContentWrapper
      title="Claim Your NFT"
      isLoading={false}
      isAuthorized={true}
    >
      <Collapse in={!!errors[activeStep]}>
        <Alert severity="error">errors[activeStep]</Alert>
      </Collapse>

      {(() => {
        switch (activeStep) {
          case 0:
            return (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Button
                  sx={{ whiteSpace: "nowrap" }}
                  variant="contained"
                  onClick={handleConnect}
                  startIcon={loading && <CircularProgress size={20} />}
                  disabled={loading || isActive}
                  color="primary"
                  title="Connect wallet"
                >
                  Connect Xumm
                </Button>
              </Box>
            );
          case 1:
            return (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Button
                  sx={{ whiteSpace: "nowrap" }}
                  variant="contained"
                  onClick={handleClaim}
                  startIcon={loading && <CircularProgress size={20} />}
                  disabled={loading || !isAuthenticated || data?.claimed}
                  color="primary"
                  title="Claim NFT"
                >
                  Claim NFT
                </Button>

                {isMobile && uuid && (
                  <Box>
                    <Button
                      sx={{ whiteSpace: "nowrap" }}
                      variant="contained"
                      onClick={() => {
                        window.location.href = `xumm://xumm.app/sign/${uuid}/deeplink`;
                      }}
                      color="primary"
                      title="Open Mobile App"
                    >
                      Open App
                    </Button>
                  </Box>
                )}
              </Box>
            );
          case 2:
            return (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                Successfully claimed NFT!
              </Box>
            );
          default:
            return null;
        }
      })()}

      <Debug
        value={{
          connected: isActive,
          type: connector?.getType(),
        }}
      />
      <Debug
        value={{
          isMobile,
          uuid,
          offerIndex: data?.offerIndex,
          claimed: data?.claimed,
        }}
      />
      <Box
        sx={{
          paddingTop: "2rem",
        }}
      >
        <Stepper activeStep={activeStep} alternativeLabel={false}>
          {steps.map((label) => (
            <Step key={label} completed={false}>
              <StepLabel error={false}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </ContentWrapper>
  );
}

export default ClaimPage;
