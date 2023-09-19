import React from "react";
import axios from "axios";
import { dropsToXrp } from "xrpl";
import { useSnackbar } from "notistack";

import API from "apis";
import { useWeb3 } from "connectors/context";
import type { Event } from "types";
import EventTable, { type EventTableRow } from "components/EventTable";
import ContentWrapper from "components/ContentWrapper";
import { useAuth } from "components/AuthContext";

function AdminEventsPage() {
  const { networkId } = useWeb3();
  const { isAuthenticated, jwt, permissions } = useAuth();
  const [data, setData] = React.useState<Event[]>();
  const { enqueueSnackbar } = useSnackbar();

  const isAuthorized = React.useMemo(() => {
    return isAuthenticated && permissions.includes("admin");
  }, [isAuthenticated, permissions]);

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (networkId && jwt) {
          const events = await API.events.getAll(jwt, {
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

    if (isAuthorized) {
      load();
    } else {
      setData(undefined);
    }

    return () => {
      mounted = false;
    };
  }, [isAuthorized, networkId, jwt]);

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
        depositAmount: event.accounting?.depositTxHash
          ? dropsToXrp(
              (
                BigInt(event.accounting.depositReserveValue) +
                BigInt(event.accounting.depositFeeValue)
              ).toString()
            )
          : undefined,
      }));
    } else {
      return [];
    }
  }, [data]);

  return (
    <ContentWrapper
      title="Events Overview"
      isLoading={false}
      isAuthorized={isAuthorized}
    >
      <EventTable rows={rows} />
    </ContentWrapper>
  );
}

export default AdminEventsPage;
