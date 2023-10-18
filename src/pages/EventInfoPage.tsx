import React from "react";
import { useParams } from "react-router-dom";
import { dropsToXrp } from "xrpl";
import axios from "axios";
import { useAtom } from "jotai";
import { useSnackbar } from "notistack";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Container,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import API from "apis";
import { EventStatus, type Claim, type Event, DialogIdentifier } from "types";

import { activeDialogAtom } from "states/atoms";
import { useAuth } from "components/AuthContext";
import AttendanceTable, { AttendanceTableRow } from "components/AttendeeTable";
import ContentWrapper from "components/ContentWrapper";
import BackButton from "components/BackButton";

const options: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

function EventInfoPage() {
  const { jwt } = useAuth();
  const [activeDialog, setActiveDialog] = useAtom(activeDialogAtom);
  const [data, setData] = React.useState<Event | null | undefined>();
  const { enqueueSnackbar } = useSnackbar();

  const { id } = useParams();

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const event = await API.event.getInfo(id!, jwt);
        if (mounted) {
          setData(event ? event : null);
        }
      } catch (err) {
        console.debug(err);
        if (mounted) {
          setData(undefined);
        }
        if (axios.isAxiosError(err)) {
          enqueueSnackbar(
            `Failed to load event data: ${err.response?.data.error}`,
            {
              variant: "error",
            }
          );
        } else {
          enqueueSnackbar("Failed to load event data", {
            variant: "error",
          });
        }
      }
    };

    // only update data, if no dialog is open
    if (!activeDialog.type) {
      if (id) {
        load();
      } else {
        setData(undefined);
      }
    }

    return () => {
      mounted = false;
    };
  }, [activeDialog, id, jwt]);

  const rows = React.useMemo<AttendanceTableRow[]>(() => {
    if (data && data.attendees) {
      const offers = data.nfts?.reduce<Record<string, Claim>>((obj, nft) => {
        if (nft.claim) {
          return { ...obj, [nft.claim.ownerWalletAddress]: nft.claim };
        } else {
          return obj;
        }
      }, {});

      return data.attendees.map((a, i) => ({
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
  }, [data]);

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

  return (
    <Container maxWidth="md">
      <ContentWrapper isLoading={data === undefined} isAuthorized={true}>
        {data ? (
          <Card variant="outlined">
            <CardHeader
              title={data.title}
              subheader={`Event #${data.id} (${EventStatus[
                data.status
              ].toLowerCase()})`}
              action={
                <React.Fragment>
                  {data.attendees && (
                    <React.Fragment>
                      <Tooltip title="Generate an invite link">
                        <IconButton
                          onClick={() => handleShare(data.id)}
                          disabled={data.status !== EventStatus.ACTIVE}
                        >
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Close down the event">
                        <IconButton
                          onClick={() => handleCancel(data.id)}
                          disabled={
                            ![
                              EventStatus.PENDING,
                              EventStatus.PAID,
                              EventStatus.ACTIVE,
                            ].includes(data.status)
                          }
                        >
                          <DeleteForeverIcon />
                        </IconButton>
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
              image={data.imageUrl}
              alt="event banner"
            />
            <CardContent>
              <Box
                sx={{
                  marginBottom: "0.75rem",
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  {data.description}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body1" color="text.secondary">
                  <strong>Date Start:</strong>{" "}
                  {new Date(data.dateStart).toLocaleDateString(
                    undefined,
                    options
                  )}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  <strong>Date End:</strong>{" "}
                  {new Date(data.dateEnd).toLocaleDateString(
                    undefined,
                    options
                  )}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  <strong>Location:</strong> {data.location}
                </Typography>
                {data.attendees && (
                  <Typography variant="body1" color="text.secondary">
                    <strong>Reserved Slots:</strong> {data.attendees.length}/
                    {data.tokenCount}
                  </Typography>
                )}
                {data.accounting && (
                  <Typography variant="body1" color="text.secondary">
                    <strong>Deposit:</strong>{" "}
                    {dropsToXrp(data.accounting?.depositReserveValue || 0)} (+
                    {dropsToXrp(data.accounting?.depositFeeValue || 0)}) XRP
                  </Typography>
                )}
              </Box>

              {data.attendees && (
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
        ) : (
          // data === null
          <Box
            sx={{
              paddingTop: "1rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="body1" fontStyle="italic">
              Event not found!
            </Typography>
          </Box>
        )}
      </ContentWrapper>
    </Container>
  );
}

export default EventInfoPage;
