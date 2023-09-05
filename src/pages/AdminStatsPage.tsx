import React from "react";
import axios from "axios";
import { useSnackbar } from "notistack";

import {
  Box,
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";

import API from "apis";
import { useWeb3 } from "connectors/context";
import type { PlatformStats } from "types";
import ContentWrapper from "components/ContentWrapper";
import { useAuth } from "components/AuthContext";
import PieChart from "components/PieChart";

function AdminStatsPage() {
  const { isActive, networkId } = useWeb3();
  const { isAuthenticated, jwt, permissions } = useAuth();
  const [data, setData] = React.useState<PlatformStats>();
  const { enqueueSnackbar } = useSnackbar();

  const isAuthorized = React.useMemo(() => {
    return isAuthenticated && permissions.includes("admin");
  }, [isAuthenticated, permissions]);

  // TODO add live updating on 10s timer ?
  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (networkId && jwt) {
          const stats = await API.admin.getStats(jwt, {
            networkId: networkId,
          });

          // TODO
          console.log(stats);

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
          enqueueSnackbar("Failed to load stats data", {
            variant: "error",
          });
        }
      }
    };

    if (isAuthorized) {
      load();
    } else {
      setData(undefined);
    }

    return () => {
      mounted = false;
    };
  }, [isAuthorized, networkId, jwt]);

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Typography variant="h6">Platform Stats</Typography>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Card variant="outlined">
          <CardContent>
            <Typography
              sx={{ fontSize: 14 }}
              color="text.secondary"
              gutterBottom
            >
              Total Users
            </Typography>
            <Typography variant="h5" component="div">
              asdf
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              adjective
            </Typography>
            <Typography variant="body2">
              well meaning and kindly.
              <br />
              {'"a benevolent smile"'}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">More Details</Button>
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Card variant="outlined">
          <CardContent>
            <Typography
              sx={{ fontSize: 14 }}
              color="text.secondary"
              gutterBottom
            >
              Total Events
            </Typography>
            <Typography variant="h5" component="div">
              asdf
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              adjective
            </Typography>
            <Typography variant="body2">
              well meaning and kindly.
              <br />
              {'"a benevolent smile"'}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">More Details</Button>
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Card variant="outlined">
          <CardContent>
            <Typography
              sx={{ fontSize: 14 }}
              color="text.secondary"
              gutterBottom
            >
              Total Balance
            </Typography>
            <Typography variant="h5" component="div">
              asdf
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              adjective
            </Typography>
            <Typography variant="body2">
              well meaning and kindly.
              <br />
              {'"a benevolent smile"'}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">More Details</Button>
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Card variant="outlined">
          <CardContent>
            <Typography
              sx={{ fontSize: 14 }}
              color="text.secondary"
              gutterBottom
            >
              Total Reserves
            </Typography>
            <Typography variant="h5" component="div">
              asdf
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              adjective
            </Typography>
            <Typography variant="body2">
              well meaning and kindly.
              <br />
              {'"a benevolent smile"'}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">More Details</Button>
          </CardActions>
        </Card>
      </Grid>

      <Grid
        item
        md={8}
        sx={{ display: { sm: "none", md: "block", lg: "none" } }}
      />

      <Grid item xs={12} md={6} lg={6}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h6">Account Balance</Typography>
          </Grid>
          <Grid item />
        </Grid>
        <Card variant="outlined" sx={{ mt: 1.5 }}>
          <CardContent>
            <Box sx={{ pt: 1, pr: 2 }}>
              <PieChart
                series={[44, 55, 13, 43, 22]}
                labels={["Team A", "Team B", "Team C", "Team D", "Team E"]}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} lg={6}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h6">Account Reserves</Typography>
          </Grid>
          <Grid item />
        </Grid>
        <Card variant="outlined" sx={{ mt: 1.5 }}>
          <CardContent>
            <Box sx={{ pt: 1, pr: 2 }}>
              <PieChart
                series={[144, 30, 13]}
                labels={["Team A", "Team B", "Team C"]}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default AdminStatsPage;
