import React from "react";
import { useNavigate } from "react-router-dom";

import { IconButton, Tooltip } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

function BackButton() {
  const navigate = useNavigate();

  return (
    <Tooltip title="Return to previous page">
      <IconButton color="primary" onClick={() => navigate(-1)}>
        <ArrowBackRoundedIcon />
      </IconButton>
    </Tooltip>
  );
}

export default BackButton;
