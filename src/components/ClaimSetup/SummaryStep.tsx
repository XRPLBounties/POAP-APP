import React from "react";

import { Box, Stack, Typography } from "@mui/material";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

import { StepProps } from "./types";

function SummaryStep({ active, setComplete }: StepProps) {
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
      <Stack direction="row" alignItems="center" gap={1}>
        <TaskAltIcon color="success" />
        <Typography align="center" variant="body1" color="text.secondary">
          Claim Successful!
        </Typography>
      </Stack>
    </Box>
  ) : null;
}

export default SummaryStep;
