import React from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useAtom } from "jotai";

import { Button } from "@mui/material";

import API from "apis";
import { useWeb3 } from "connectors/context";
import { DialogIdentifier, Event } from "types";
import { activeDialogAtom } from "states/atoms";
import EventTable, { type EventTableRow } from "components/EventTable";
import ContentWrapper from "components/ContentWrapper";
import { useAuth } from "components/AuthContext";

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

  const rows = React.useMemo<EventTableRow[]>(() => {
    if (data) {
      return data.map((event) => ({
        id: event.id,
        status: event.status,
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

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setActiveDialog({ type: DialogIdentifier.DIALOG_CREATE });
  };

  return (
    <ContentWrapper
      title="My Events Overview"
      isLoading={!Boolean(data)}
      isAuthorized={isAuthorized}
      secondary={
        <Button
          title="Create a new event"
          color="primary"
          variant="contained"
          onClick={handleClick}
          disabled={!(isActive && isAuthorized)}
        >
          New
        </Button>
      }
    >
      <EventTable rows={rows} isOwner={true} />
    </ContentWrapper>
  );
}

export default OrganizerPage;
