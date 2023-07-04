import React from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useAtomValue } from "jotai";

import Typography from "@mui/material/Typography";

import API from "apis";
import { useWeb3 } from "connectors/context";
import { Event, NetworkIdentifier } from "types";
import { activeDialogAtom } from "states/atoms";
import EventTable, { type EventTableRow } from "components/EventTable";
import ContentWrapper from "components/ContentWrapper";

function HomePage() {
  const { isActive, networkId } = useWeb3();
  const [data, setData] = React.useState<Event[]>();
  const activeDialog = useAtomValue(activeDialogAtom);
  const { enqueueSnackbar } = useSnackbar();

  const tooltip = React.useMemo(
    () => (
      <React.Fragment>
        <Typography variant="subtitle1">Information</Typography>
        <Typography variant="body2">
          Connect a wallet to continue. This will allow you to join public
          events, create new events and claim NFTs from events you're attending.
        </Typography>
      </React.Fragment>
    ),
    []
  );

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const events = await API.events.getPublic({
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
          enqueueSnackbar(`Failed to load events data: ${err.response?.data.error}`, {
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
        dateStart: new Date(event.dateStart),
        dateEnd: new Date(event.dateEnd),
        slotsTaken: event.attendees?.length,
        slotsTotal: event.tokenCount,
      }));
    } else {
      return [];
    }
  }, [data]);

  return (
    <ContentWrapper
      title="Public Events Overview"
      tooltip={tooltip}
      isLoading={!Boolean(data)}
      isAuthorized={true}
    >
      <EventTable rows={rows} />
    </ContentWrapper>
  );
}

export default HomePage;
