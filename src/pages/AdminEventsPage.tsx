import React from "react";
import axios from "axios";
import { useAtomValue } from "jotai";
import { dropsToXrp } from "xrpl";
import { useSnackbar } from "notistack";

import { Typography } from "@mui/material";

import API from "apis";
import { useWeb3 } from "connectors/context";
import type { Event } from "types";
import { activeDialogAtom } from "states/atoms";
import EventTable, { type EventTableRow } from "components/EventTable";
import ContentWrapper from "components/ContentWrapper";
import { useAuth } from "components/AuthContext";
import BackButton from "components/BackButton";

function AdminEventsPage() {
  const { networkId } = useWeb3();
  const { isAuthenticated, jwt, permissions } = useAuth();
  const [data, setData] = React.useState<Event[]>();
  const activeDialog = useAtomValue(activeDialogAtom);
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
          enqueueSnackbar(
            `Failed to load events data: ${(err as Error).message}`,
            {
              variant: "error",
            }
          );
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
  }, [activeDialog, isAuthorized, networkId, jwt]);

  const rows = React.useMemo<EventTableRow[]>(() => {
    if (data) {
      return data.map((event) => ({
        id: event.id,
        status: event.status,
        ownerWalletAddress: event.ownerWalletAddress,
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
      isLoading={false}
      isAuthorized={isAuthorized}
      secondary={<BackButton />}
      offsetSecondaryTop="0rem"
    >
      <Typography sx={{ marginBottom: "1rem" }} variant="h6">
        Events Overview
      </Typography>
      <EventTable rows={rows} />
    </ContentWrapper>
  );
}

export default AdminEventsPage;
