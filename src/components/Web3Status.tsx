import React from "react";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { useSnackbar } from "notistack";

import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu, { MenuProps } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import { gem } from "connectors/gem";
import { selectedWalletAtom } from "states/atoms";
import { shortenAddress } from "utils/strings";
import { useWeb3 } from "connectors/context";
import { xumm } from "connectors/xumm";
import { getConnector } from "connectors";
import type { Connector } from "connectors/connector";
import { ConnectorType } from "types";
import { useAuth } from "components/AuthContext";

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    marginTop: theme.spacing(0.5),
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
  },
}));

const DEFAULT_STATUS = "CONNECT WALLET";

function Web3Status() {
  const { connector, account, isActive } = useWeb3();
  const { setClaimFlow } = useAuth();
  const [selectedWallet, setSelectedWallet] = useAtom(selectedWalletAtom);
  const [status, setStatus] = React.useState<string>(DEFAULT_STATUS);
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // eagerly connect
  let selectedConnector: Connector | undefined;
  if (selectedWallet) {
    try {
      selectedConnector = getConnector(selectedWallet as ConnectorType);
    } catch {
      setSelectedWallet(ConnectorType.EMPTY);
    }
  }

  React.useEffect(() => {
    if (selectedConnector && !selectedConnector.state.isActive()) {
      // Note: Don't eagerly connect to the GemWallet as it currently prompts
      // the user for a password every time the page is refreshed.
      if (selectedConnector !== gem) {
        selectedConnector.activate();
      }
    }
  }, [selectedConnector]);

  React.useEffect(() => {
    if (account) {
      setStatus(shortenAddress(account));
    } else {
      setStatus(DEFAULT_STATUS);
    }
  }, [account, isActive]);

  const handleMenuClose = React.useCallback(() => {
    setMenuAnchor(null);
  }, []);

  const handleClick = React.useCallback(
    async (event: React.MouseEvent<HTMLElement>) => {
      setMenuAnchor(event.currentTarget);
    },
    []
  );

  const handleAction = React.useCallback(
    async (action: string) => {
      setMenuAnchor(null);
      if (action === "disconnect") {
        try {
          if (connector?.deactivate) {
            await connector.deactivate();
          } else {
            await connector?.reset();
          }
          setSelectedWallet(ConnectorType.EMPTY);
          navigate("/");
        } catch (error) {
          enqueueSnackbar(
            `Failed to disconnect wallet: ${(error as Error).message}`,
            { variant: "error" }
          );
        }
      } else if (action === "xumm") {
        setClaimFlow(false);
        try {
          await xumm.activate();
          setSelectedWallet(ConnectorType.XUMM);
          navigate("/organizer");
        } catch (error) {
          enqueueSnackbar(
            `Failed to connect wallet: ${(error as Error).message}`,
            { variant: "error" }
          );
        }
      } else if (action === "gem") {
        setClaimFlow(false);
        try {
          await gem.activate();
          setSelectedWallet(ConnectorType.GEM);
          navigate("/organizer");
        } catch (error) {
          enqueueSnackbar(
            `Failed to connect wallet: ${(error as Error).message}`,
            { variant: "error" }
          );
        }
      }
    },
    [connector, enqueueSnackbar, setSelectedWallet, setClaimFlow]
  );

  return (
    <Box>
      <Button
        sx={{ whiteSpace: "nowrap", textTransform: "none" }}
        variant="contained"
        onClick={handleClick}
        color="primary"
        title="Web3 status"
      >
        {status}
      </Button>
      <StyledMenu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor) && !isActive}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction("xumm")}>Xumm Wallet</MenuItem>
        <MenuItem onClick={() => handleAction("gem")}>Gem Wallet</MenuItem>
      </StyledMenu>
      <StyledMenu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor) && isActive}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction("disconnect")}>
          Disconnect
        </MenuItem>
      </StyledMenu>
    </Box>
  );
}

export default Web3Status;
