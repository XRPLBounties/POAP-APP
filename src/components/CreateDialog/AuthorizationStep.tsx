import React from "react";
import axios from "axios";

import { useSnackbar } from "notistack";

import { Box, Button, Typography } from "@mui/material";

import CircularProgress from "@mui/material/CircularProgress";

import API from "apis";
import { Minter } from "types";
import { useWeb3 } from "connectors/context";
import { useAuth } from "components/AuthContext";
import Loader from "components/Loader";
import Debug from "components/Debug";
import { StepProps } from "./types";
import ContentBox from "./ContentBox";
import InfoBox from "components/InfoBox";

function AuthorizationStep({
  active,
  loading,
  setLoading,
  setError,
  setComplete,
  setActions,
}: StepProps) {
  const { provider, networkId } = useWeb3();
  const { isAuthenticated, jwt, permissions } = useAuth();
  const [data, setData] = React.useState<Minter>();
  const [count, setCount] = React.useState<number>(0);
  const { enqueueSnackbar } = useSnackbar();

  const isAuthorized = React.useMemo(() => {
    return isAuthenticated && permissions.includes("organizer");
  }, [isAuthenticated, permissions]);

  // update parent state
  React.useEffect(() => {
    if (active) {
      setComplete(Boolean(data?.isConfigured));
    }
  }, [active, data]);

  // fetch authorized minter info
  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (networkId && jwt) {
          const minter = await API.event.getMinter(jwt, {
            networkId: networkId,
          });

          if (mounted) {
            setError(null);
            setData(minter);
          }
        }
      } catch (err) {
        const msg = "Failed to load minter data";
        console.debug(err);
        if (mounted) {
          setError(msg);
          setData(undefined);
        }
        if (axios.isAxiosError(err)) {
          enqueueSnackbar(`${msg}: ${err.response?.data.error}`, {
            variant: "error",
          });
        } else {
          enqueueSnackbar(`${msg}: ${(err as Error).message}`, {
            variant: "error",
          });
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
  }, [active, isAuthorized, networkId, jwt, count]);

  const handleConfirm = React.useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      setLoading(true);
      try {
        if (provider && data?.walletAddress) {
          const result = await provider.setAccount(data.walletAddress);
          const txHash = await result.resolved;

          if (!txHash) {
            throw Error("Transaction rejected");
          }

          // force update authorized minter info
          setCount((c) => c + 1);
        }
      } catch (err) {
        const msg = "Failed to authorized account";
        console.debug(err);
        setError(msg);
        if (axios.isAxiosError(err)) {
          enqueueSnackbar(`${msg}: ${err.response?.data.error}`, {
            variant: "error",
          });
        } else {
          enqueueSnackbar(`${msg}: ${(err as Error).message}`, {
            variant: "error",
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [data?.walletAddress, provider]
  );

  // set actions
  React.useEffect(() => {
    if (active) {
      setActions([
        <Button
          color="primary"
          onClick={handleConfirm}
          startIcon={loading && <CircularProgress size={20} />}
          disabled={
            loading || !isAuthorized || !Boolean(data) || data?.isConfigured
          }
        >
          Authorize
        </Button>,
      ]);
    } else {
      setActions([]);
    }
  }, [active, loading, isAuthorized, data, handleConfirm]);

  return active ? (
    <Box>
      <InfoBox sx={{ marginBottom: "1rem" }}>
        The platform mints and manages event NFTs on behalf of an organizer.
        This requires a one-time on-chain authorization.
      </InfoBox>

      {data ? (
        <React.Fragment>
          <Typography
            sx={{ fontWeight: "500", marginBottom: "0.375rem" }}
            variant="body2"
          >
            Platform Minter Address:
          </Typography>
          <ContentBox>
            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
              {data.walletAddress}
            </Typography>
          </ContentBox>
        </React.Fragment>
      ) : (
        <Loader text="Checking Minter Status..." />
      )}

      <Debug
        value={{
          isAuthorized,
          isConfigured: data?.isConfigured,
          minterAddress: data?.walletAddress,
        }}
      />
    </Box>
  ) : null;
}

export default AuthorizationStep;
