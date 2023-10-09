import * as React from "react";
import { dropsToXrp } from "xrpl";
import { Link } from "react-router-dom";
import { useSetAtom } from "jotai";

import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BlockIcon from "@mui/icons-material/Block";

import { Event, DialogIdentifier, EventStatus } from "types";
import { activeDialogAtom } from "states/atoms";

type EventCardProps = {
  event: Event;
};

function EventCard({ event }: EventCardProps) {
  const setActiveDialog = useSetAtom(activeDialogAtom);

  const handleShare = React.useCallback(
    (id: number) => {
      setActiveDialog({
        type: DialogIdentifier.DIALOG_LINK,
        data: { eventId: id },
      });
    },
    [setActiveDialog]
  );

  const handleCancel = React.useCallback(
    (id: number) => {
      setActiveDialog({
        type: DialogIdentifier.DIALOG_CANCEL,
        data: { eventId: id },
      });
    },
    [setActiveDialog]
  );

  const handlePay = React.useCallback(
    (id: number) => {
      setActiveDialog({
        type: DialogIdentifier.DIALOG_CREATE,
        data: { eventId: id },
      });
    },
    [setActiveDialog]
  );

  const statusIcon = React.useMemo(() => {
    switch (event.status) {
      case EventStatus.PENDING:
        return (
          <Tooltip title="Event requires payment">
            <IconButton disableRipple>
              <WarningAmberIcon color="warning" />
            </IconButton>
          </Tooltip>
        );
      case EventStatus.PAID:
        return (
          <Tooltip title="Event will be ready soon (minting NFTs)">
            <IconButton disableRipple>
              <CheckCircleOutlineIcon
                sx={{ color: (theme) => theme.palette.secondary.light }}
              />
            </IconButton>
          </Tooltip>
        );
      case EventStatus.ACTIVE:
        return (
          <Tooltip title="Event is active">
            <IconButton disableRipple>
              <CheckCircleOutlineIcon
                sx={{ color: (theme) => theme.palette.success.light }}
              />
            </IconButton>
          </Tooltip>
        );
      case EventStatus.CANCELED:
      case EventStatus.CLOSED:
        return (
          <Tooltip title="Event is closed">
            <IconButton disableRipple>
              <BlockIcon
                sx={{
                  color: "grey.600",
                }}
              />
            </IconButton>
          </Tooltip>
        );
      case EventStatus.REFUNDED:
        return (
          <Tooltip title="Event deposit has been refunded">
            <IconButton disableRipple>
              <BlockIcon
                sx={{
                  color: "grey.600",
                }}
              />
            </IconButton>
          </Tooltip>
        );
    }
  }, [event.status]);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return (
    <Card>
      <CardActionArea disableRipple component={Link} to={`/event/${event.id}`}>
        <CardMedia
          sx={{
            filter: [
              EventStatus.CANCELED,
              EventStatus.CLOSED,
              EventStatus.REFUNDED,
            ].includes(event.status)
              ? "grayscale(1.0) opacity(60%)"
              : undefined,
          }}
          component="img"
          height="140"
          image={event.imageUrl}
          alt="event image"
        />
        <CardContent sx={{ minHeight: "150px" }}>
          <Typography noWrap variant="h6" component="div">
            {event.title}
          </Typography>
          <Typography sx={{ mb: 1.5 }} variant="body2" color="text.secondary">
            Event #{event.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Date Start:</strong>{" "}
            {new Date(event.dateStart).toLocaleDateString(undefined, options)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Date End:</strong>{" "}
            {new Date(event.dateEnd).toLocaleDateString(undefined, options)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Reserved Slots:</strong> {event.attendees?.length}/
            {event.tokenCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Deposit:</strong>{" "}
            {dropsToXrp(event.accounting?.depositReserveValue || 0)} (+
            {dropsToXrp(event.accounting?.depositFeeValue || 0)}) XRP
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions disableSpacing>
        <Box sx={{ marginRight: "auto" }}>{statusIcon}</Box>

        {event.status === EventStatus.PENDING && (
          <Button
            title="Transfer the event deposit"
            onClick={() => handlePay(event.id)}
            size="small"
            color="primary"
            disabled={event.status !== EventStatus.PENDING}
          >
            Pay
          </Button>
        )}
        <Button
          title="Generate an invitation link"
          onClick={() => handleShare(event.id)}
          size="small"
          color="primary"
          disabled={event.status !== EventStatus.ACTIVE}
        >
          Share
        </Button>
        <Button
          title="Close down the event"
          onClick={() => handleCancel(event.id)}
          size="small"
          color="primary"
          disabled={
            ![
              EventStatus.PENDING,
              EventStatus.PAID,
              EventStatus.ACTIVE,
            ].includes(event.status)
          }
        >
          Cancel
        </Button>
      </CardActions>
    </Card>
  );
}

export default EventCard;
