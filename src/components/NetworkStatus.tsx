import React from "react";

import Chip from "@mui/material/Chip";

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
    <Chip
      sx={{
        borderRadius: "4px",
        textTransform: "uppercase",
        height: "36.5px",
        fontWeight: 450,
        fontSize: "0.875rem",
      }}
      variant="filled"
      label={networkName}
    />
  );
}

export default NetworkStatus;
