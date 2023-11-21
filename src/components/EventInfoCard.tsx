import React from "react";
import { useNavigate } from "react-router-dom";
import { dropsToXrp } from "xrpl";
import { useAtom } from "jotai";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import VerifiedIcon from "@mui/icons-material/Verified";

import { EventStatus, type Claim, type Event, DialogIdentifier } from "types";

import { activeDialogAtom } from "states/atoms";
import AttendanceTable, { AttendanceTableRow } from "components/AttendeeTable";
import BackButton from "components/BackButton";

const options: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

type EventInfoCardProps = {
  isBasic: boolean;
  event: Event;
  maskedId: string;
};

function EventInfoCard({ isBasic, event, maskedId }: EventInfoCardProps) {
  const [activeDialog, setActiveDialog] = useAtom(activeDialogAtom);
  const navigate = useNavigate();

  const rows = React.useMemo<AttendanceTableRow[]>(() => {
    if (event.owner && event.attendees) {
      const offers = event.nfts?.reduce<Record<string, Claim>>((obj, nft) => {
        if (nft.claim) {
          return { ...obj, [nft.claim.ownerWalletAddress]: nft.claim };
        } else {
          return obj;
        }
      }, {});

      return event.attendees.map((a, i) => ({
        id: i,
        index: i + 1,
        walletAddress: a.walletAddress,
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        tokenId:
          offers && a.walletAddress in offers
            ? offers[a.walletAddress].tokenId
            : undefined,
        claimed:
          offers && a.walletAddress in offers
            ? offers[a.walletAddress].claimed
            : false,
      }));
    } else {
      return [];
    }
  }, [event]);

  const handleShare = React.useCallback(
    (id: Event["id"]) => {
      setActiveDialog({
        type: DialogIdentifier.DIALOG_LINK,
        data: { eventId: id },
      });
    },
    [setActiveDialog]
  );

  const handleCancel = React.useCallback(
    (id: Event["id"]) => {
      setActiveDialog({
        type: DialogIdentifier.DIALOG_CANCEL,
        data: { eventId: id },
      });
    },
    [setActiveDialog]
  );

  return (
    <Card variant="outlined">
      <CardHeader
        title={event.title}
        subheader={`Event #${event.id} (${EventStatus[
          event.status
        ].toLowerCase()})`}
        action={
          <React.Fragment>
            <Tooltip title="Verify NFT ownership">
              <span>
                <IconButton
                  onClick={() => navigate(`/verify/${maskedId}`)}
                  disabled={event.status === EventStatus.PENDING}
                >
                  <VerifiedIcon />
                </IconButton>
              </span>
            </Tooltip>
            {event.owner && !isBasic && (
              <React.Fragment>
                <Tooltip title="Generate an invite link">
                  <span>
                    <IconButton
                      onClick={() => handleShare(event.id)}
                      disabled={event.status !== EventStatus.ACTIVE}
                    >
                      <ShareIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Close down the event">
                  <span>
                    <IconButton
                      onClick={() => handleCancel(event.id)}
                      disabled={
                        ![
                          EventStatus.PENDING,
                          EventStatus.PAID,
                          EventStatus.ACTIVE,
                        ].includes(event.status)
                      }
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </React.Fragment>
            )}
            <BackButton />
          </React.Fragment>
        }
      />
      <CardMedia
        component="img"
        height="350"
        image={event.imageUrl}
        alt="event banner"
      />
      <CardContent>
        <Box
          sx={{
            marginBottom: "0.75rem",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            {event.description}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body1" color="text.secondary">
            <strong>Date Start:</strong>{" "}
            {new Date(event.dateStart).toLocaleDateString(undefined, options)}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Date End:</strong>{" "}
            {new Date(event.dateEnd).toLocaleDateString(undefined, options)}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Location:</strong> {event.location}
          </Typography>
          {event.attendees && (
            <Typography variant="body1" color="text.secondary">
              <strong>Reserved Slots:</strong> {event.attendees.length}/
              {event.tokenCount}
            </Typography>
          )}
          {event.accounting && (
            <Typography variant="body1" color="text.secondary">
              <strong>Deposit:</strong>{" "}
              {dropsToXrp(event.accounting?.depositReserveValue || 0)} (+
              {dropsToXrp(event.accounting?.depositFeeValue || 0)}) XRP
            </Typography>
          )}
        </Box>

        {event.owner && event.attendees && !isBasic && (
          <Box sx={{ marginTop: "0.75rem" }}>
            <Typography
              sx={{ marginBottom: "0.75rem", fontWeight: "bold" }}
              variant="body1"
            >
              Attendees:
            </Typography>
            <AttendanceTable rows={rows} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default EventInfoCard;
