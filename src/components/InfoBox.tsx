import React from "react";

import {
  Box,
  Alert,
  AlertTitle,
  type SxProps,
  type Theme,
} from "@mui/material";

type InfoBoxProps = {
  sx?: SxProps<Theme>;
  text: React.ReactNode;
};

function InfoBox({ sx, text }: InfoBoxProps) {
  return (
    <Box sx={sx}>
      <Alert severity="info">
        <AlertTitle>Info</AlertTitle>
        {text}
      </Alert>
    </Box>
  );
}

export default InfoBox;
