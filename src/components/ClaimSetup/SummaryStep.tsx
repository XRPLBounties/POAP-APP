import React from "react";

import { Box, Stack, Typography } from "@mui/material";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

import { StepProps } from "./types";
import ContentBox from "components/ContentBox";

function SummaryStep({ active, tokenId, setComplete }: StepProps) {
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
        sx={{ marginBottom: "1.5rem" }}
        direction="row"
        alignItems="center"
        gap={1}
      >
        <TaskAltIcon color="success" />
        <Typography align="center" variant="body1" color="text.secondary">
          Claim Successful!
        </Typography>
      </Stack>
      <ContentBox
        sx={{
          wordBreak: "break-all",
        }}
      >
        {tokenId}
      </ContentBox>
    </Box>
  ) : null;
}

export default SummaryStep;
