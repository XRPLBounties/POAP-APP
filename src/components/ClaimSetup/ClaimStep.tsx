import React from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { isMobile } from "react-device-detect";
import { useSnackbar } from "notistack";

import { Box, Button, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

import API from "apis";
import { useAuth } from "components/AuthContext";
import Debug from "components/Debug";
import { useWeb3 } from "connectors/context";
import { Claim } from "types";
import { StepProps } from "./types";

function SummaryStep({
  active,
  loading,
  setError,
  setTokenId,
  setComplete,
  setLoading,
}: StepProps) {
  const { account, provider } = useWeb3();
  const { isAuthenticated, jwt, permissions } = useAuth();
  const [data, setData] = React.useState<Claim | null>();
  const [uuid, setUuid] = React.useState<string>();
  const [count, setCount] = React.useState<number>(0);
  const { enqueueSnackbar } = useSnackbar();

  const { id } = useParams();

  const isAuthorized = React.useMemo(() => {
    return isAuthenticated && permissions.includes("attendee");
  }, [isAuthenticated, permissions]);

  // update parent state
  React.useEffect(() => {
    if (active) {
      setTokenId(data?.tokenId);
      setComplete(Boolean(data?.claimed));
    }
  }, [active, data]);

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
            setError(null);
            setData(offer);
          }
        }
      } catch (err) {
        console.debug(err);
        if (mounted) {
          if (axios.isAxiosError(err)) {
            setError(`Failed to load offer data: ${err.response?.data.error}`);
          } else {
            setError(`Failed to load offer data: ${(err as Error).message}`);
          }
          setData(undefined);
        }
      }
    };

    if (active && isAuthorized) {
      load();
    } else {
      setData(undefined);
    }

    return () => {
      mounted = false;
    };
  }, [active, isAuthorized, jwt, id, count]);

  const handleClaim = React.useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
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
            setData(offer);
          }

          // claim nft
          if (offer?.offerIndex && !offer?.claimed) {
            const result = await provider.acceptOffer(
              offer.offerIndex,
              isMobile
            );
            setUuid(result.uuid);

            // open app
            if (isMobile) {
              window.location.href = `xumm://xumm.app/sign/${result.uuid}/deeplink`;
            } else {
              enqueueSnackbar(
                "Creating payload (confirm the transaction in your wallet)",
                {
                  variant: "info",
                }
              );
            }

            const txHash = await result.resolved;

            if (!txHash) {
              setUuid(undefined);
              throw Error("Transaction rejected");
            }

            // force update claim info
            setCount((c) => c + 1);
          }
        }
      } catch (err) {
        console.debug(err);
        if (axios.isAxiosError(err)) {
          setError(`Claim failed: ${err.response?.data.error}`);
        } else {
          setError(`Claim failed: ${(err as Error).message}`);
        }
      } finally {
        setLoading(false);
      }
    },
    [provider, account, id, jwt, data]
  );

  return active ? (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography
        sx={{
          marginBottom: "1rem",
        }}
        align="center"
        variant="body1"
        color="text.secondary"
      >
        Claim your NFT by signing an NFT offer acceptance transaction.
      </Typography>

      <Button
        sx={{ whiteSpace: "nowrap", margin: "1rem 0rem" }}
        variant="contained"
        onClick={handleClaim}
        startIcon={loading && <CircularProgress size={20} />}
        disabled={loading || !isAuthorized || data?.claimed}
        color="primary"
        title="Claim your NFT"
      >
        {isMobile ? "Claim NFT (Open App)" : "Claim NFT"}
      </Button>

      <Debug
        value={{
          isMobile,
          uuid,
          // offerIndex: data?.offerIndex,
          claimed: data?.claimed,
        }}
      />
    </Box>
  ) : null;
}

export default SummaryStep;
