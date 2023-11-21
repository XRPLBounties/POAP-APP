import React from "react";

import { Box, SxProps, Theme } from "@mui/material";

export type ContentBoxProps = {
  sx?: SxProps<Theme>;
  children?: React.ReactNode;
};

function ContentBox({ sx, children }: ContentBoxProps) {
  return (
    <Box
      sx={{
        display: "block",
        padding: "0.375rem 1rem",
        bgcolor: "grey.100",
        color: "grey.800",
        border: "1px solid",
        borderColor: "grey.300",
        borderRadius: "4px",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export default ContentBox;
