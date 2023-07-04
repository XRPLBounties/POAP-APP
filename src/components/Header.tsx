import React from "react";
import { NavLink } from "react-router-dom";

import { styled } from "@mui/system";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { List as MuiList } from "@mui/material";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Stack from "@mui/material/Stack";

import config from "config";
import Web3Status from "components/Web3Status";
import NetworkStatus from "components/NetworkStatus";
import ConnectivityStatus from "components/ConnectivityStatus";
import AuthStatus from "components/AuthStatus";
import { useWeb3 } from "connectors/context";
import { useAuth } from "components/AuthContext";

const StyledList = styled(MuiList)<{ component?: React.ElementType }>(
  ({ theme }) => ({
    display: "flex",
    flexDirection: "row",
    padding: 0,
    "& .MuiListItem-root": {
      padding: 0,
    },
    "& .MuiListItemText-root": {
      margin: 0,
    },
    "& .MuiListItemButton-root": {
      padding: "6px 12px",
      "&:hover": {
        color: "#09c1d1",
      },
      "&.active": {
        color: theme.palette.primary.dark,
      },
    },
  })
) as typeof MuiList;

function Header() {
  const { isActive } = useWeb3();
  const { isAuthenticated, permissions } = useAuth();

  const isAuthorized = React.useMemo(() => {
    return isAuthenticated && permissions.includes("organizer");
  }, [isAuthenticated, permissions]);

  const entries: Array<[string, string, boolean]> = React.useMemo(
    () => [
      ["Home", "/", false],
      ["Organizer", "/organizer", !(isActive && isAuthorized)],
      ["Attendee", "/attendee", !(isActive && isAuthenticated)],
      ...(config.debug
        ? ([["Debug", "/debug", false]] as Array<[string, string, boolean]>)
        : []),
    ],
    [isActive, isAuthenticated, isAuthorized]
  );

  return (
    <AppBar
      sx={{
        bgcolor: "#c9e9ec",
        borderBottom: `1px solid #a8c3c5`,
        boxShadow: "none",
      }}
      color="inherit"
      position="fixed"
    >
      <ConnectivityStatus />
      <Container maxWidth="lg">
        <Toolbar component="div" disableGutters>
          <Box sx={{ marginRight: "auto" }}>
            <StyledList component="nav">
              {entries.map(([name, to, disabled], i) => (
                <ListItem key={i}>
                  <ListItemButton
                    disabled={disabled}
                    component={NavLink}
                    to={to}
                  >
                    <ListItemText
                      sx={{ whiteSpace: "nowrap" }}
                      primary={name}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </StyledList>
          </Box>
          <Stack direction="row" spacing={2}>
            <NetworkStatus />
            <Web3Status />
            <AuthStatus />
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;
