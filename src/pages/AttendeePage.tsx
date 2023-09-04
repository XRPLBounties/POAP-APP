import React from "react";
import axios from "axios";
import { useAtomValue } from "jotai";
import { useSnackbar } from "notistack";

import { activeDialogAtom } from "states/atoms";
import { Claim } from "types";
import { useAuth } from "components/AuthContext";
import { useWeb3 } from "connectors/context";
import API from "apis";
import ContentWrapper from "components/ContentWrapper";
import EventTable, { type EventTableRow } from "components/EventTable";

function AttendeePage() {
  const { isActive, networkId } = useWeb3();
  const { isAuthenticated, jwt } = useAuth();
  const [data, setData] = React.useState<Claim[]>();
  const activeDialog = useAtomValue(activeDialogAtom);
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (networkId && jwt) {
          const offers = await API.offers.getAll(jwt, {
            networkId: networkId,
            limit: 100,
          });

          if (mounted) {
            setData(offers);
          }
        }
      } catch (err) {
        console.debug(err);
        if (mounted) {
          setData(undefined);
        }
        if (axios.isAxiosError(err)) {
          enqueueSnackbar(`Failed to load offers data: ${err.response?.data.error}`, {
            variant: "error",
          });
        } else {
          enqueueSnackbar("Failed to load offers data", {
            variant: "error",
          });
        }
      }
    };

    // only update data, if no dialog is open
    if (!activeDialog.type) {
      if (isAuthenticated) {
        load();
      } else {
        setData(undefined);
      }
    }

    return () => {
      mounted = false;
    };
  }, [activeDialog, isActive, networkId, isAuthenticated, jwt]);

  const rows = React.useMemo<EventTableRow[]>(() => {
    if (data) {
      return data.map((offer) => ({
        id: offer.token.eventId,
        status: offer.token.event.status,
        title: offer.token.event.title,
        dateStart: new Date(offer.token.event.dateStart),
        dateEnd: new Date(offer.token.event.dateEnd),
        slotsTaken: offer.token.event.attendees?.length,
        slotsTotal: offer.token.event.tokenCount,
        claimed: offer.claimed,
        offerIndex: offer.offerIndex,
      }));
    } else {
      return [];
    }
  }, [data]);

  return (
    <ContentWrapper
      title="My Offers Overview"
      isLoading={!Boolean(data)}
      isAuthorized={isAuthenticated}
    >
      <EventTable rows={rows} isAttendee={true} />;
    </ContentWrapper>
  );
}

export default AttendeePage;
