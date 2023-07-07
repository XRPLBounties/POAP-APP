import React from "react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <Box id="error-page">
      <Typography variant="h1">
        Oops!
      </Typography>
      <Typography variant="body1">
        Sorry, an unexpected error has occurred.
      </Typography>
      {
        isRouteErrorResponse(error) && (
          <Typography variant="body1">
            <i>{error.statusText || error.statusText}</i>  
          </Typography>
        )
      }
    </Box>
  );
}

export default ErrorPage;
