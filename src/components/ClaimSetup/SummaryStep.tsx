import React from "react";

import { Box } from "@mui/material";

import { StepProps } from "./types";

function SummaryStep({
  active,
  loading,
  setError,
  setComplete,
  setLoading,
}: StepProps) {
  // update parent state
  React.useEffect(() => {
    if (active) {
      setComplete(true);
    }
  }, [active]);

  return active ? (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      Successfully claimed NFT!
    </Box>
  ) : null;
}

export default SummaryStep;
