import React from "react";

import { styled } from "@mui/material/styles";
import { SxProps, Theme } from "@mui/system";
import Fade from "@mui/material/Fade";
import IconButton from "@mui/material/IconButton";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 320,
  },
  "& .MuiTypography-subtitle1": {
    fontWeight: 600,
    paddingTop: "0.25rem",
    paddingBottom: "0.25rem",
  },
  "& .MuiTypography-subtitle2": {
    fontWeight: 600,
    paddingBottom: "0.25rem",
  },
  "& .MuiTypography-body2": {
    paddingBottom: "0.25rem",
  },
}));

export type HelpButtonProps = {
  sx?: SxProps<Theme>;
  content: string | React.ReactNode;
};

export function HelpButton(props: HelpButtonProps) {
  const { sx, content } = props;

  return (
    <StyledTooltip
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 600 }}
      title={content}
      placement="right-start"
      arrow
    >
      <IconButton sx={sx}>
        <HelpOutlineIcon />
      </IconButton>
    </StyledTooltip>
  );
}

export default HelpButton;
