import React from "react";
import axios from "axios";
import { useSnackbar } from "notistack";

import { Box, Button, Stack } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

import API from "apis";
import { useWeb3 } from "connectors/context";
import { useAuth } from "components/AuthContext";

const handleClearStorage = async (
  event: React.MouseEvent<HTMLButtonElement>
) => {
  console.log("Clearing storages");
  window.localStorage.clear();
  window.sessionStorage.clear();
};

function DebugPage() {
  const { provider, networkId } = useWeb3();
  const { isAuthenticated, jwt, permissions } = useAuth();
  const [loading, setLoading] = React.useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  const isAuthorized = React.useMemo(() => {
    return isAuthenticated && permissions.includes("organizer");
  }, [isAuthenticated, permissions]);

  const handleRevokeMinter = React.useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      setLoading(true);
      try {
        if (provider && networkId && jwt) {
          // fetch authorized minter status
          const minter = await API.event.getMinter(jwt, {
            networkId: networkId,
          });

          if (!minter.isConfigured) {
            return;
          }

          // revoke minter
          const result = await provider.setAccount(null);
          enqueueSnackbar(
            "Creating payload (confirm the transaction in your wallet)",
            {
              variant: "info",
            }
          );

          const txHash = await result.resolved;
          if (!txHash) {
            throw Error("Transaction rejected");
          }
        }
      } catch (err) {
        const msg = "Failed to revoke minter";
        console.debug(err);
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
    [networkId, provider, jwt]
  );

  return (
    <Box>
      <Stack direction="column" spacing={1}>
        <Button
          color="primary"
          variant="contained"
          onClick={handleClearStorage}
        >
          Clear Storage
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={handleRevokeMinter}
          startIcon={loading && <CircularProgress size={20} />}
          disabled={loading || !isAuthorized}
        >
          Revoke Minter
        </Button>
      </Stack>
    </Box>
  );
}

export default DebugPage;
