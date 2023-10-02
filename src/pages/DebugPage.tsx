import React from "react";

import { Box, Button, Stack } from "@mui/material";

const clearStorage = async () => {
  console.log("Clearing storages");
  window.localStorage.clear();
  window.sessionStorage.clear();
};

function DebugPage() {
  return (
    <Box>
      <Stack sx={{ mb: "1rem" }} direction="row" spacing={1}>
        <Button onClick={() => clearStorage()} variant="contained">
          Clear Storage
        </Button>
      </Stack>
    </Box>
  );
}

export default DebugPage;
