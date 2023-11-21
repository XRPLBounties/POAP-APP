import React from "react";

import { Box, Stack, Typography } from "@mui/material";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

import { StepProps } from "./types";
import { useWeb3 } from "connectors/context";
import LabeledContentBox from "components/LabeledContentBox";

function SummaryStep({ active, tokenId, setComplete }: StepProps) {
  const { account } = useWeb3();

  // update parent state
  React.useEffect(() => {
    if (active) {
      setComplete(Boolean(tokenId));
    }
  }, [active, tokenId]);

  return active ? (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Stack
        sx={{ marginBottom: "2rem" }}
        direction="row"
        alignItems="center"
        gap={1}
      >
        <TaskAltIcon fontSize="large" color="success" />
        <Typography align="center" variant="h6" color="text.secondary">
          Claim Successful!
        </Typography>
      </Stack>
      <LabeledContentBox
        title="Wallet Address:"
        sx={{
          marginBottom: "0.75rem",
          wordBreak: "break-all",
        }}
      >
        {account}
      </LabeledContentBox>
      <LabeledContentBox
        title="Token ID:"
        sx={{
          wordBreak: "break-all",
        }}
      >
        {tokenId}
      </LabeledContentBox>
    </Box>
  ) : null;
}

export default SummaryStep;
