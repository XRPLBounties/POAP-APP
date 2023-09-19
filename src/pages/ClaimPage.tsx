import React from "react";

import ContentWrapper from "components/ContentWrapper";
import ClaimSetup from "components/ClaimSetup";

function ClaimPage() {
  return (
    <ContentWrapper
      title="Claim Your NFT"
      isLoading={false}
      isAuthorized={true}
    >
      <ClaimSetup />
    </ContentWrapper>
  );
}

export default ClaimPage;
