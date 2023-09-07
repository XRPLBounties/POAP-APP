import React from "react";
import axios from "axios";

import { useSnackbar } from "notistack";

import { Box, Button } from "@mui/material";

import CircularProgress from "@mui/material/CircularProgress";

import API from "apis";
import { useWeb3 } from "connectors/context";
import { useAuth } from "components/AuthContext";
import Loader from "components/Loader";
import { StepProps } from "./types";
import { Minter } from "types";

function AuthorizationStep({
  active,
  loading,
  setLoading,
  setError,
  setComplete,
  setActions,
  close,
}: StepProps) {
  const { provider, networkId } = useWeb3();
  const { isAuthenticated, jwt, permissions } = useAuth();
  const [data, setData] = React.useState<Minter>();
  // const [loading, setLoading] = React.useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  const isAuthorized = React.useMemo(() => {
    return isAuthenticated && permissions.includes("organizer");
  }, [isAuthenticated, permissions]);

  // TODO set errors

  // update parent state
  React.useEffect(() => {
    setComplete(Boolean(data?.isConfigured));
  }, [data]);

  // fetch authorized minter info
  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (networkId && jwt) {
          const minter = await API.event.getMinter(jwt, {
            networkId: networkId,
          });

          // TODO
          console.log(minter);

          if (mounted) {
            setData(minter);
          }
        }
      } catch (err) {
        console.debug(err);
        if (mounted) {
          setData(undefined);
        }
        if (axios.isAxiosError(err)) {
          enqueueSnackbar(
            `Failed to load stats data: ${err.response?.data.error}`,
            {
              variant: "error",
            }
          );
        } else {
          enqueueSnackbar("Failed to load stats data", {
            variant: "error",
          });
        }
      }
    };

    if (isAuthorized) {
      load();
    } else {
      setData(undefined);
    }

    return () => {
      mounted = false;
    };
  }, [isAuthorized, networkId, jwt]);

  // TODO
  const handleConfirm = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setLoading(true);
    try {
      if (provider && data?.walletAddress) {
        const result = await provider.setAccount(data.walletAddress);
        const success = await result.resolved;

        console.log(success);
        // TODO force redownload minter
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
    }
  };

  // // set actions
  // React.useEffect(() => {
  //   console.log("setting actions", active);
  //   if (active) {
  //     setActions([
  //       <Button
  //         color="primary"
  //         onClick={handleConfirm}
  //         startIcon={loading && <CircularProgress size={20} />}
  //         disabled={loading || !isAuthorized || !Boolean(data)}
  //       >
  //         Authorize
  //       </Button>,
  //     ]);
  //   } else {
  //     setActions([]);
  //   }
  // }, [active, loading, isAuthorized, data, handleConfirm]);

  // TODO display "checking minter status" while we load the status with spinner
  // TODO
  return active ? (
    <Box>
      <p>isAuthorized: {isAuthorized ? "true" : "false"}</p>

      {data ? (
        <div>
          <p>isConfigured: {data.isConfigured ? "true" : "false"}</p>
          <p>minter address: {data.walletAddress}</p>
        </div>
      ) : (
        <div>
          <Loader text="Checking Minter Status..." />
        </div>
      )}

      <Button color="primary" onClick={close} disabled={loading}>
        Cancel
      </Button>
      <Button
        color="primary"
        onClick={handleConfirm}
        startIcon={loading && <CircularProgress size={20} />}
        disabled={loading || !isAuthorized || !Boolean(data)}
      >
        Authorize
      </Button>
    </Box>
  ) : null;
}

export default AuthorizationStep;
