import React from "react";

import { Typography } from "@mui/material";

import { useWeb3 } from "connectors/context";
import ContentWrapper from "components/ContentWrapper";

function HomePage() {
  const { isActive, networkId } = useWeb3();

  const tooltip = React.useMemo(
    () => (
      <React.Fragment>
        <Typography variant="subtitle1">Information</Typography>
        <Typography variant="body2">
          Connect a wallet to continue. This will allow you to join public
          events, create new events and claim NFTs of events you're attending.
        </Typography>
      </React.Fragment>
    ),
    []
  );

  return (
    <ContentWrapper
      title="Home"
      tooltip={tooltip}
      isLoading={false}
      isAuthorized={true}
    >
      <Typography variant="h5">Welcome!</Typography>
    </ContentWrapper>
  );
}

export default HomePage;
