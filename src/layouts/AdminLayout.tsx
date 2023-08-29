import { Outlet, NavLink } from "react-router-dom";
import { useAtomValue } from "jotai";

import {
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  useTheme,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import QueryStatsIcon from "@mui/icons-material/QueryStats";

import { activeDialogAtom } from "states/atoms";
import Header from "components/Header";

// TODO remove
const drawerWidth = 240;

function AdminLayout() {
  const theme = useTheme();
  const activeDialog = useAtomValue(activeDialogAtom);

  const entries = [
    { label: "Overview", icon: <QueryStatsIcon />, to: "/admin/stats" },
    { label: "Users", icon: <PeopleIcon />, to: "/admin/users" },
    { label: "Events", icon: <EventIcon />, to: "/admin/events" },
  ];

  return (
    <Box>
      <Header />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List
            sx={{
              "& .MuiListItemButton-root": {
                padding: "6px 12px",
                "&:hover": {
                  color: "#09c1d1",
                },
                "&.active": {
                  color: (theme) => theme.palette.primary.dark,
                },
              },
            }}
          >
            {entries.map((entry, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton component={NavLink} to={entry.to}>
                  <ListItemIcon>{entry.icon}</ListItemIcon>
                  <ListItemText primary={entry.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          position: "relative",
          minHeight: "100vh",
          backgroundColor: "rgb(252, 252, 252)",
        }}
      >
        <Container
          sx={{
            paddingTop: "8.5rem",
            display: "flex",
            justifyContent: "center",
          }}
          maxWidth="lg"
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

export default AdminLayout;
