import React from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useAtom } from "jotai";

import { Box, Button } from "@mui/material";

import API from "apis";
import { useWeb3 } from "connectors/context";
import { DialogIdentifier, Event } from "types";
import { activeDialogAtom } from "states/atoms";
import EventTable, { type EventTableRow } from "components/EventTable";
import ContentWrapper from "components/ContentWrapper";
import { useAuth } from "components/AuthContext";

function AdminPage() {
  const { isActive, networkId } = useWeb3();
  const { isAuthenticated, jwt, permissions } = useAuth();
  const [data, setData] = React.useState<Event[]>();
  const [slots, setSlots] = React.useState<{ used: number; max: number }>();
  const [activeDialog, setActiveDialog] = useAtom(activeDialogAtom);
  const { enqueueSnackbar } = useSnackbar();

  const isAuthorized = React.useMemo(() => {
    return isAuthenticated && permissions.includes("admin");
  }, [isAuthenticated, permissions]);

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

  // TODO add EventTable isAdmin
  return (
    <ContentWrapper
      title="Admin Panel"
      isLoading={!Boolean(data)}
      isAuthorized={isAuthorized}
    >
      <EventTable rows={rows} isOwner={true} />
    </ContentWrapper>
  );
}

export default AdminPage;
