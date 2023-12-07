import type { ReactNode } from "react";

import { Box, Stack, Typography } from "@mui/material";

import HelpButton from "components/HelpButton";
import Loader from "components/Loader";

export type ContentWrapperProps = {
  children?: ReactNode;
  tooltip?: ReactNode;
  secondary?: ReactNode;
  offsetSecondaryTop?: string;
  isLoading?: boolean;
  isAuthorized?: boolean;
};

export function ContentWrapper({
  children,
  tooltip,
  secondary,
  offsetSecondaryTop,
  isLoading,
  isAuthorized,
}: ContentWrapperProps) {
  return (
    <Box sx={{ width: "100%", position: "relative", paddingBottom: "3.0rem" }}>
      <Box
        sx={{
          position: "absolute",
          top: offsetSecondaryTop ?? "0.75rem",
          right: "0.75rem",
        }}
      >
        <Stack direction="row" spacing={2}>
          {secondary}
          {tooltip && (
            <HelpButton sx={{ marginLeft: "16px" }} content={tooltip} />
          )}
        </Stack>
      </Box>

      {isAuthorized ? (
        isLoading ? (
          <Loader />
        ) : (
          children
        )
      ) : (
        <Box
          sx={{
            paddingTop: "1rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="body1" fontStyle="italic">
            Not Authorized!
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default ContentWrapper;
