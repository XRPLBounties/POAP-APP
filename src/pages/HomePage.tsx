import React from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useAtom } from "jotai";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import API from "apis";
import { useWeb3 } from "connectors/context";
import { DialogIdentifier, Event, NetworkIdentifier } from "types";
import Loader from "components/Loader";
import { activeDialogAtom } from "states/atoms";
import EventTable, { type EventTableRow } from "components/EventTable";

function HomePage() {
  const { isActive, networkId } = useWeb3();
  const [data, setData] = React.useState<Event[]>();
  const [activeDialog, setActiveDialog] = useAtom(activeDialogAtom);
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const events = await API.getEvents({
          networkId: networkId ?? NetworkIdentifier.UNKNOWN,
          limit: 100,
        });

        if (mounted) {
          setData(events);
        }
      } catch (err) {
        console.debug(err);
        if (mounted) {
          setData(undefined);
        }
        if (axios.isAxiosError(err)) {
          enqueueSnackbar(`Failed to load events data: ${err.message}`, {
            variant: "error",
          });
        } else {
          enqueueSnackbar("Failed to load events data", {
            variant: "error",
          });
        }
      }
    };

    // only update data, if no dialog is open
    if (!activeDialog.type) {
      load();
    }

    return () => {
      mounted = false;
    };
  }, [activeDialog, isActive, networkId]);

  const rows = React.useMemo<EventTableRow[]>(() => {
    if (data) {
      return data.map((event) => ({
        id: event.id,
        title: event.title,
        address: event.ownerWalletAddress,
        count: event.tokenCount,
      }));
    } else {
      return [];
    }
  }, [data]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setActiveDialog({ type: DialogIdentifier.DIALOG_MINT });
  };

  return (
    <React.Fragment>
      <Box sx={{ width: "48rem" }}>
        <Paper sx={{ position: "relative", padding: "1.5rem" }} elevation={1}>
          <Typography sx={{ marginBottom: "0.75rem" }} variant="h5">
            Overview
          </Typography>
          {!isActive && (
            <Typography variant="body2">
              Connect a wallet to continue! (join an existing event or create a
              new one)
            </Typography>
          )}

          <Typography sx={{ margin: "0.75rem 0" }} variant="h6">
            Public Events
          </Typography>
          {data ? <EventTable rows={rows} /> : <Loader />}

          <Button
            sx={{ position: "absolute", top: "1rem", right: "1rem" }}
            title="Create a new event"
            color="primary"
            variant="contained"
            onClick={handleClick}
            disabled={!isActive}
          >
            New
          </Button>
        </Paper>
      </Box>
    </React.Fragment>
  );
}

export default HomePage;
