import React from "react";
import { useSetAtom } from "jotai";
import { useSnackbar } from "notistack";

import {
  Box,
  Button,
  Card,
  CardHeader,
  ClickAwayListener,
  Divider,
  Fade,
  FormControlLabel,
  FormGroup,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Switch,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

import { activeDialogAtom } from "states/atoms";
import { DialogIdentifier } from "types";
import { useAuth } from "components/AuthContext";
import { useWeb3 } from "connectors/context";

function AuthStatus() {
  const { isActive } = useWeb3();
  const { isAuthenticated, isAuto, login, logout, toggleAuto } = useAuth();
  const setActiveDialog = useSetAtom(activeDialogAtom);
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  };

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (err) {
      console.debug(err);
      enqueueSnackbar(`Failed to login: ${(err as Error).message}`, {
        variant: "error",
      });
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        ref={anchorRef}
        title="Authentication status"
        onClick={handleToggle}
      >
        {isAuthenticated ? <CheckIcon /> : <DoDisturbIcon />}
      </Button>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, 7],
              },
            },
          ],
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              sx={{
                width: "100%",
                minWidth: 265,
                maxWidth: 420,
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Card>
                  <CardHeader
                    sx={{
                      padding: "16px 20px 10px 16px",
                    }}
                    titleTypographyProps={{
                      sx: { fontSize: 18 },
                      variant: "subtitle2",
                    }}
                    title="Account"
                  />
                  <List
                    component="nav"
                    sx={{
                      padding: 0,
                      "& .MuiListItemIcon-root": {
                        minWidth: 32,
                      },
                    }}
                  >
                    <ListItem>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={isAuto}
                              onChange={() => toggleAuto()}
                            />
                          }
                          label="Automatic Login"
                        />
                      </FormGroup>
                    </ListItem>

                    {isAuthenticated && (
                      <React.Fragment>
                        <Divider />

                        <ListItemButton
                          onClick={() => {
                            setOpen(false);
                            setActiveDialog({
                              type: DialogIdentifier.DIALOG_PROFILE,
                            });
                          }}
                        >
                          <ListItemIcon>
                            <ManageAccountsIcon />
                          </ListItemIcon>
                          <ListItemText primary="Edit Profile" />
                        </ListItemButton>
                      </React.Fragment>
                    )}

                    <Divider />
                    {isAuthenticated ? (
                      <ListItemButton onClick={() => logout()}>
                        <ListItemIcon>
                          <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                      </ListItemButton>
                    ) : (
                      <ListItemButton
                        disabled={!isActive}
                        onClick={() => {
                          setOpen(false);
                          handleLogin();
                        }}
                      >
                        <ListItemIcon>
                          <LoginIcon />
                        </ListItemIcon>
                        <ListItemText primary="Login" />
                      </ListItemButton>
                    )}
                  </List>
                </Card>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
}

export default AuthStatus;
