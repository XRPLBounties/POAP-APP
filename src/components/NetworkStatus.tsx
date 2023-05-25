import React from "react";
import Button from "@mui/material/Button";
import { useWeb3 } from "connectors/context";
import { ChainIdentifier } from "connectors/chain";

function NetworkStatus() {
  const { chainId } = useWeb3();

  const networkName = React.useMemo(() => {
    switch (chainId) {
      case ChainIdentifier.MAINNET:
        return "Mainnet";
      case ChainIdentifier.TESTNET:
        return "Testnet";
      case ChainIdentifier.DEVNET:
        return "Devnet";
      case ChainIdentifier.AMM_DEVNET:
        return "AMM-Devnet";
      default:
        return "Unknown";
    }
  }, [chainId]);

  return (
    <React.Fragment>
      <Button
        variant="contained"
        onClick={undefined}
        color="primary"
        disabled={!Boolean(chainId)}
        title="Network status"
      >
        {networkName}
      </Button>
    </React.Fragment>
  );
}

export default NetworkStatus;
