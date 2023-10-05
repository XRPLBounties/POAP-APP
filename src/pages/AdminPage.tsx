import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { dropsToXrp, xrpToDrops } from "xrpl";
import { useSnackbar } from "notistack";

import {
  Box,
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  IconButton,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import API from "apis";
import { useWeb3 } from "connectors/context";
import type { PlatformStats } from "types";
import ContentWrapper from "components/ContentWrapper";
import { useAuth } from "components/AuthContext";
import PieChart from "components/PieChart";

const SPENDABLE_THRESHOLD = BigInt(xrpToDrops(20));

type Info = {
  id: string;
  title: string;
  value: string | number;
  to?: string;
};

function AdminPage() {
  const { networkId } = useWeb3();
  const { isAuthenticated, jwt, permissions } = useAuth();
  const [data, setData] = React.useState<PlatformStats>();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const isAuthorized = React.useMemo(() => {
    return isAuthenticated && permissions.includes("admin");
  }, [isAuthenticated, permissions]);

  // live updating stats
  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (networkId && jwt) {
          const stats = await API.admin.getStats(jwt, {
            networkId: networkId,
          });

          if (mounted) {
            setData(stats);
          }
        }
      } catch (err) {
        console.debug(err);
        if (mounted) {
          setData(undefined);
        }
        if (axios.isAxiosError(err)) {
          enqueueSnackbar(
            `Failed to load stats data: ${err.response?.data.error}`,
            {
              variant: "error",
            }
          );
        } else {
          enqueueSnackbar(
            `Failed to load stats data: ${(err as Error).message}`,
            {
              variant: "error",
            }
          );
        }
      }
    };

    const check = () => {
      if (isAuthorized) {
        load();
      } else {
        setData(undefined);
      }
    };

    const interval = setInterval(check, 15 * 1000);
    check();

    // clear interval to prevent memory leaks when unmounting
    return () => {
      clearInterval(interval);
      mounted = false;
    };
  }, [isAuthorized, networkId, jwt]);

  const stats: Info[] = React.useMemo(() => {
    if (data) {
      return [
        {
          id: "organizers",
          title: "Total Organizers",
          value: data.users.organizers,
          to: "/admin/users",
        },
        {
          id: "events",
          title: "Total Events",
          value: data.events.total,
          to: "/admin/events",
        },
        {
          id: "balance",
          title: "Total Vault Balance",
          value: `${dropsToXrp(data.account.balance)} XRP`,
        },
        {
          id: "reserve",
          title: "Total Vault Reserve",
          value: `${dropsToXrp(data.account.reserve)} XRP`,
        },
      ];
    } else {
      return [];
    }
  }, [data]);

  const spendable = React.useMemo(() => {
    if (data?.account) {
      return BigInt(data.account.balance) - BigInt(data.account.reserve);
    } else {
      return BigInt(0);
    }
  }, [data?.account]);

  return (
    <ContentWrapper isLoading={!Boolean(data)} isAuthorized={isAuthorized}>
      <Grid container rowSpacing={4.5} columnSpacing={2.75}>
        <Grid item xs={12} sx={{ marginBottom: "-18px" }}>
          <Typography variant="h6">Platform Stats</Typography>
        </Grid>
        {stats.map((info, index) => (
          <Grid key={index} item xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ minHeight: "140px" }} variant="outlined">
              <CardContent>
                <Typography
                  sx={{ fontSize: 14 }}
                  color="text.secondary"
                  gutterBottom
                >
                  {info.title}
                </Typography>
                <Typography variant="h5" component="div">
                  {info.value}
                </Typography>
                {/* <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  subtitle
                </Typography>
                <Typography variant="body2">some text</Typography> */}
              </CardContent>
              {info.to && (
                <CardActions>
                  <Button
                    onClick={() => navigate(info.to!)}
                    variant="text"
                    size="small"
                  >
                    See Details
                  </Button>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}

        <Grid
          item
          md={8}
          sx={{ display: { sm: "none", md: "block", lg: "none" } }}
        />

        {data && (
          <React.Fragment>
            <Grid item xs={12} md={6} lg={6}>
              <Grid
                container
                alignItems="center"
                justifyContent="space-between"
              >
                <Grid item>
                  <Typography variant="h6">Event Stats</Typography>
                </Grid>
                <Grid item />
              </Grid>
              <Card variant="outlined" sx={{ marginTop: "12px" }}>
                <CardContent>
                  <Box sx={{ paddingTop: "8px", paddingRight: "24px" }}>
                    <PieChart
                      series={[
                        data.events.pending,
                        data.events.active,
                        data.events.finished,
                      ]}
                      labels={["Pending", "Active", "Finished"]}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <Grid
                container
                alignItems="center"
                justifyContent="space-between"
              >
                <Grid item>
                  <Typography variant="h6">Account Stats</Typography>
                </Grid>
                <Grid item />
              </Grid>
              <Card variant="outlined" sx={{ marginTop: "12px" }}>
                <CardContent sx={{ position: "relative" }}>
                  {spendable < SPENDABLE_THRESHOLD && (
                    <Tooltip
                      sx={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                      }}
                      title="Low vault account balance!"
                    >
                      <IconButton disableRipple>
                        <WarningAmberIcon color="warning" />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Box
                    sx={{
                      paddingTop: "8px",
                      paddingRight: "24px",
                    }}
                  >
                    <PieChart
                      series={[
                        Number(dropsToXrp(spendable.toString())),
                        Number(dropsToXrp(data.account.reserve)),
                      ]}
                      labels={["Spendable", "Reserve"]}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </React.Fragment>
        )}
      </Grid>
    </ContentWrapper>
  );
}

export default AdminPage;
