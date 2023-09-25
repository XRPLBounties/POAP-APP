import React from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useAtom } from "jotai";

import { Button, Grid, Tooltip, Typography } from "@mui/material";

import API from "apis";
import { useWeb3 } from "connectors/context";
import { DialogIdentifier, Event } from "types";
import { activeDialogAtom } from "states/atoms";
import ContentWrapper from "components/ContentWrapper";
import { useAuth } from "components/AuthContext";
import EventGrid from "components/EventGrid";

function OrganizerPage() {
  const { isActive, networkId } = useWeb3();
  const { isAuthenticated, jwt, permissions } = useAuth();
  const [data, setData] = React.useState<Event[]>();
  const [activeDialog, setActiveDialog] = useAtom(activeDialogAtom);
  const { enqueueSnackbar } = useSnackbar();

  const isAuthorized = React.useMemo(() => {
    return isAuthenticated && permissions.includes("organizer");
  }, [isAuthenticated, permissions]);

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (networkId && jwt) {
          const events = await API.events.getOwned(jwt, {
            networkId: networkId,
            limit: 100,
          });

          if (mounted) {
            setData(events);
          }
        }
      } catch (err) {
        console.debug(err);
        if (mounted) {
          setData(undefined);
        }
        if (axios.isAxiosError(err)) {
          enqueueSnackbar(
            `Failed to load events data: ${err.response?.data.error}`,
            {
              variant: "error",
            }
          );
        } else {
          enqueueSnackbar("Failed to load events data", {
            variant: "error",
          });
        }
      }
    };

    // only update data, if no dialog is open
    if (!activeDialog.type) {
      if (isAuthorized) {
        load();
      } else {
        setData(undefined);
      }
    }

    return () => {
      mounted = false;
    };
  }, [activeDialog, isActive, networkId, isAuthorized, jwt]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setActiveDialog({ type: DialogIdentifier.DIALOG_CREATE });
  };

  return (
    <ContentWrapper isLoading={!Boolean(data)} isAuthorized={isAuthorized}>
      <Grid
        sx={{ mb: "1.125rem" }}
        container
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid item>
          <Typography variant="h6">Events Overview</Typography>
        </Grid>
        <Grid item>
          <Tooltip title="Create a new event">
            <Button
              title="Create a new event"
              color="primary"
              variant="contained"
              onClick={handleClick}
              disabled={!(isActive && isAuthorized)}
            >
              New
            </Button>
          </Tooltip>
        </Grid>
      </Grid>
      <EventGrid events={data ?? []} />
    </ContentWrapper>
  );
}

export default OrganizerPage;
