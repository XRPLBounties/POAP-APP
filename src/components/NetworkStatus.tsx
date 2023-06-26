import React from "react";
import Button from "@mui/material/Button";
import { useWeb3 } from "connectors/context";
import { NetworkIdentifier } from "types";

function NetworkStatus() {
  const { networkId } = useWeb3();

  const networkName = React.useMemo(() => {
    switch (networkId) {
      case NetworkIdentifier.MAINNET:
        return "Mainnet";
      case NetworkIdentifier.TESTNET:
        return "Testnet";
      case NetworkIdentifier.DEVNET:
        return "Devnet";
      case NetworkIdentifier.AMM_DEVNET:
        return "AMM-Devnet";
      default:
        return "Unknown";
    }
  }, [networkId]);

  return (
    <React.Fragment>
      <Button
        variant="contained"
        color="primary"
        disabled={!Boolean(networkId)}
        disableRipple
        title="Network status"
      >
        {networkName}
      </Button>
    </React.Fragment>
  );
}

export default NetworkStatus;
