import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import HelpButton from "components/HelpButton";
import Loader from "components/Loader";

export type ContentWrapperProps = {
  children?: ReactNode;
  title?: string;
  tooltip?: ReactNode;
  secondary?: ReactNode;
  isLoading?: boolean;
  isAuthenticated?: boolean;
};

export function ContentWrapper(props: ContentWrapperProps) {
  const { children, title, tooltip, secondary, isLoading, isAuthenticated } =
    props;
  return (
    <Box sx={{ width: "48rem" }}>
      <Paper
        sx={{ position: "relative", padding: "1.5rem", borderRadius: "4px" }}
        elevation={1}
        square
      >
        <Box sx={{ position: "absolute", top: "1rem", right: "1rem" }}>
          {secondary}
          {tooltip && (
            <HelpButton sx={{ marginLeft: "16px" }} content={tooltip} />
          )}
        </Box>
        {title && (
          <Box>
            <Typography sx={{ marginBottom: "0.75rem" }} variant="h6">
              {title}
            </Typography>
          </Box>
        )}
        {isAuthenticated ? (
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
      </Paper>
    </Box>
  );
}

export default ContentWrapper;