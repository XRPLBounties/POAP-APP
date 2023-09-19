import React from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { isMobile } from "react-device-detect";

import { Box, Button } from "@mui/material";
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
  setComplete,
  setLoading,
}: StepProps) {
  const { isActive, account, provider, networkId } = useWeb3();
  const { isAuthenticated, jwt, permissions } = useAuth();
  const [data, setData] = React.useState<Claim | null>();
  const [uuid, setUuid] = React.useState<string>();
  const [count, setCount] = React.useState<number>(0);

  const { id } = useParams();

  const isAuthorized = React.useMemo(() => {
    return isAuthenticated && permissions.includes("attendee");
  }, [isAuthenticated, permissions]);

  // update parent state
  React.useEffect(() => {
    if (active) {
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

  // TODO make useCallback
  // TODO change account -> isActive ?
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
            // enqueueSnackbar(`Sign-up successful: Event #${id}`, {
            //   variant: "success",
            // });
            setData(offer);
          }

          // claim nft
          if (offer?.offerIndex && !offer?.claimed) {
            // TODO this might actually be helpful
            // enqueueSnackbar(
            //   "Creating NFT claim request (confirm the transaction in your wallet)",
            //   {
            //     variant: "warning",
            //     autoHideDuration: 30000,
            //   }
            // );
            const result = await provider.acceptOffer(offer.offerIndex);

            setUuid(result.uuid);

            const txHash = await result.resolved;
            console.log("txHash", txHash);

            if (txHash) {
              // enqueueSnackbar("Claim successful", {
              //   variant: "success",
              // });
              // TODO trigger accepted to reload claim info

              // force update claim info
              setCount((c) => c + 1);

              // bad
              // offer.claimed = true;
              // setData(offer);
            } else {
              setError(`Claim failed: Unable to claim NFT`);
              setUuid(undefined);
            }
          }
        }
      } catch (err) {
        console.debug(err);
        if (axios.isAxiosError(err)) {
          setError(`Sign-up failed: ${err.response?.data.error}`);
        } else {
          setError(`Sign-up failed: ${(err as Error).message}`);
        }
      } finally {
        console.log("Finally being called");
        setLoading(false);
        // setData(undefined);
        // setActiveDialog({});
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

      <Debug
        value={{
          isMobile,
          uuid,
          offerIndex: data?.offerIndex,
          claimed: data?.claimed,
        }}
      />
    </Box>
  ) : null;
}

export default SummaryStep;
