import React from "react";
import { useAtom } from "jotai";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAtomValue } from "jotai";
import { useSnackbar } from "notistack";

import {
  Button,
  MobileStepper,
  Stepper,
  Step,
  StepLabel,
  Box,
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

const steps = ["Connect Wallet", "Claim NFT", "Finished"];

function ClaimPage() {
  const { connector, provider, account, isActive } = useWeb3();
  const { isAuthenticated, jwt, permissions } = useAuth();
  const [selectedWallet, setSelectedWallet] = useAtom(selectedWalletAtom);
  const [data, setData] = React.useState<Offer | null>();
  const [uuid, setUuid] = React.useState<string>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [activeStep, setActiveStep] = React.useState<number>();
  const { enqueueSnackbar } = useSnackbar();

  const { id } = useParams();

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
  }, [isAuthenticated, jwt]);

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

  const handleClaim = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setLoading(true);
    try {
      if (provider && account && id && jwt) {
        if (data === null) {
          const offer = await API.event.join(jwt, {
            maskedEventId: id,
            createOffer: true,
          });
          console.debug("JoinResult", offer);
          enqueueSnackbar(`Sign-up successful: Event #${id}`, {
            variant: "success",
          });
          setData(offer);
        }

        if (data?.offerIndex && !data?.claimed) {
          enqueueSnackbar(
            "Creating NFT claim request (confirm the transaction in your wallet)",
            {
              variant: "warning",
              autoHideDuration: 30000,
            }
          );
          const result = await provider.acceptOffer(data.offerIndex);

          setUuid(result.uuid);

          const success = await result.resolved;

          if (success) {
            enqueueSnackbar("Claim successful", {
              variant: "success",
            });
            // TODO trigger accepted to reload claim info
          } else {
            enqueueSnackbar(`Claim failed: Unable to claim NFT`, {
              variant: "error",
            });
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
      setLoading(false);
      // setData(undefined);
      // setActiveDialog({});
    }
  };

  // const handleClaim = async (event: React.MouseEvent<HTMLButtonElement>) => {
  //   // setLoading(true);
  //   try {
  //     if (provider && account && id && jwt) {
  //       const offer = await API.event.claim(jwt, {
  //         maskedEventId: id,
  //       });
  //       console.debug("ClaimResult", offer);

  //       if (offer && offer.offerIndex && !offer.claimed) {
  //         enqueueSnackbar(
  //           "Creating NFT claim request (confirm the transaction in your wallet)",
  //           {
  //             variant: "warning",
  //             autoHideDuration: 30000,
  //           }
  //         );
  //         const success = await provider.acceptOffer(offer.offerIndex);

  //         if (success) {
  //           enqueueSnackbar("Claim successful", {
  //             variant: "success",
  //           });
  //         } else {
  //           enqueueSnackbar(`Claim failed: Unable to claim NFT`, {
  //             variant: "error",
  //           });
  //         }
  //       } else {
  //         enqueueSnackbar(`Claim successful: Already claimed NFT`, {
  //           variant: "success",
  //         });
  //       }
  //     }
  //   } catch (err) {
  //     console.debug(err);
  //     if (axios.isAxiosError(err)) {
  //       enqueueSnackbar(`Claim failed: ${err.response?.data.error}`, {
  //         variant: "error",
  //       });
  //     } else {
  //       enqueueSnackbar(`Claim failed: ${(err as Error).message}`, {
  //         variant: "error",
  //       });
  //     }
  //   } finally {
  //     // setLoading(false);
  //     // setData(undefined);
  //   }
  // };

  return (
    <ContentWrapper title="Claim" isLoading={false} isAuthorized={true}>
      <Box>
        <Typography>event id: {id}</Typography>
      </Box>
      <Box>
        <Button
          sx={{ whiteSpace: "nowrap" }}
          variant="contained"
          onClick={handleConnect}
          startIcon={loading && <CircularProgress size={20} />}
          disabled={loading}
          color="primary"
          title="Connect XUMM wallet"
        >
          Connect Xumm
        </Button>
        <Typography>connected: {isActive ? "true" : "false"}</Typography>
        {/* <p>{document.location.href}</p> */}
      </Box>
      <Box>
        <Button
          sx={{ whiteSpace: "nowrap" }}
          variant="contained"
          onClick={handleClaim}
          startIcon={loading && <CircularProgress size={20} />}
          disabled={loading || !isAuthenticated}
          color="primary"
          title="Claim NFT"
        >
          Claim NFT
        </Button>

        <Typography>uuid: {uuid}</Typography>
        {uuid && (
          <p>
            <a href={`xumm://xumm.app/sign/${uuid}/deeplink`}>
              deeplink
            </a>
          </p>
        )}
        <Typography>offer: {data?.offerIndex?.substring(0, 4)}</Typography>
        <Typography>claimed: {data?.claimed ? "true" : "false"}</Typography>
      </Box>
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
