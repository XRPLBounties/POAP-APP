import React from "react";

import { Box, Typography } from "@mui/material";

import ContentBox, { ContentBoxProps } from "./ContentBox";

type LabeledContentBoxProps = { title: string } & ContentBoxProps;

function LabeledContentBox({ title, sx, children }: LabeledContentBoxProps) {
  return (
    <Box>
      <Typography variant="body2" fontWeight="bold">
        {title}
      </Typography>
      <ContentBox sx={sx}>{children}</ContentBox>
    </Box>
  );
}

export default LabeledContentBox;
