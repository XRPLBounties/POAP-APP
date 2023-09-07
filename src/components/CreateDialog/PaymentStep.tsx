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

function PaymentStep({ active, setError, setComplete, close }: StepProps) {
  const { provider, networkId } = useWeb3();
  const { isAuthenticated, jwt, permissions } = useAuth();
  const [data, setData] = React.useState<Minter>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  const isAuthorized = React.useMemo(() => {
    return isAuthenticated && permissions.includes("organizer");
  }, [isAuthenticated, permissions]);

  // TODO only load event info, if active, if not active reset

  // TODO display "checking minter status" while we load the status with spinner
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
        // onClick={handleConfirm}
        startIcon={loading && <CircularProgress size={20} />}
        disabled={loading || !isAuthorized || !Boolean(data)}
      >
        Authorize
      </Button>
    </Box>
  ) : null;
}

export default PaymentStep;
