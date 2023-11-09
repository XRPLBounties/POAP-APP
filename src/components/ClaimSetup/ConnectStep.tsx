import React from "react";
import { useAtom } from "jotai";

import { Box, Button, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

import { useAuth } from "components/AuthContext";
import { Debug } from "components/Debug";
import { useWeb3 } from "connectors/context";
import { selectedWalletAtom } from "states/atoms";
import { xumm } from "connectors/xumm";
import { ConnectorType } from "types";
import { StepProps } from "./types";

function ConnectStep({
  active,
  loading,
  setError,
  setComplete,
  setLoading,
}: StepProps) {
  const { connector, isActive } = useWeb3();
  const { isAuthenticated, permissions, setClaimFlow } = useAuth();
  const [selectedWallet, setSelectedWallet] = useAtom(selectedWalletAtom);

  const isAuthorized = React.useMemo(() => {
    return isAuthenticated && permissions.includes("attendee");
  }, [isAuthenticated, permissions]);

  // update parent state
  React.useEffect(() => {
    if (active) {
      setComplete(isActive && isAuthorized);
    }
  }, [active, isActive, isAuthorized]);

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
        setError(null);
      } catch (err) {
        console.debug(err);
        setError(`Failed to disconnect wallet: ${(err as Error).message}`);
        return;
      }
    }

    // set login flow
    setClaimFlow(true);

    setLoading(true);
    try {
      await xumm.activate();
      setSelectedWallet(ConnectorType.XUMM);
      setError(null);
    } catch (err) {
      console.debug(err);
      setError(`Failed to connect wallet: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [connector, isActive, setSelectedWallet, setClaimFlow]);

  return active ? (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
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
        Connect your Xaman (Xumm) wallet to start the NFT claiming process.
      </Typography>
      
      <Button
        sx={{ whiteSpace: "nowrap", margin: "1rem 0rem" }}
        variant="contained"
        onClick={handleConnect}
        startIcon={loading && <CircularProgress size={20} />}
        disabled={loading || isActive}
        color="primary"
        title="Connect Xaman (Xumm) wallet"
      >
        Connect Wallet
      </Button>

      <Debug
        value={{
          connected: isActive,
          type: connector?.getType(),
        }}
      />
    </Box>
  ) : null;
}

export default ConnectStep;
