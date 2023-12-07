import React from "react";

import {
  Box,
  Alert,
  AlertTitle,
  type SxProps,
  type Theme,
} from "@mui/material";

type InfoBoxProps = {
  title?: string;
  sx?: SxProps<Theme>;
  children?: React.ReactNode;
};

function InfoBox({ title, sx, children }: InfoBoxProps) {
  return (
    <Box sx={sx}>
      <Alert severity="info">
        <AlertTitle>{title ?? "Info"}</AlertTitle>
        {children}
      </Alert>
    </Box>
  );
}

export default InfoBox;
