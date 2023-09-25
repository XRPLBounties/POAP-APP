import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Container,
  IconButton,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import API from "apis";
import type { Event } from "types";

import { useAuth } from "components/AuthContext";
import AttendanceTable, { AttendanceTableRow } from "components/AttendeeTable";
import ContentWrapper from "components/ContentWrapper";

function EventInfoPage() {
  const { jwt } = useAuth();
  const [data, setData] = React.useState<Event | null | undefined>();
  const { enqueueSnackbar } = useSnackbar();

  const { id } = useParams();
  const navigate = useNavigate();

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

    if (id) {
      if (parseInt(id)) {
        load();
      } else {
        setData(null); // invalid, event not found
      }
    } else {
      setData(undefined);
    }

    return () => {
      mounted = false;
    };
  }, [id, jwt]);

  const rows = React.useMemo<AttendanceTableRow[]>(() => {
    if (data && data.attendees) {
      return data.attendees.map((a, i) => ({
        id: i,
        index: i + 1,
        walletAddress: a.walletAddress,
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        // TODO
        // tokenId:
        // claimed:
      }));
    } else {
      return [];
    }
  }, [data]);

  return (
    <Container maxWidth="md">
      <ContentWrapper
        isLoading={data === undefined}
        isAuthorized={true}
        secondary={
          <IconButton
            title="Return to previous page"
            color="primary"
            onClick={() => navigate(-1)}
          >
            <ArrowBackRoundedIcon />
          </IconButton>
        }
      >
        {data ? (
          <Card>
            <CardHeader title={data.title} subheader={`Event #${data.id}`} />
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
                <Typography sx={{ marginBottom: "0.5rem" }} variant="h6">
                  Description:
                </Typography>
                <Typography variant="body1">{data.description}</Typography>
              </Box>

              <Box
                sx={{
                  marginBottom: "0.75rem",
                }}
              >
                <Typography sx={{ marginBottom: "0.5rem" }} variant="h6">
                  Information:
                </Typography>
                <Typography variant="body1">
                  <strong>Date Start:</strong>{" "}
                  {new Date(data.dateStart).toString()}
                </Typography>
                <Typography variant="body1">
                  <strong>Date End:</strong> {new Date(data.dateEnd).toString()}
                </Typography>
                <Typography variant="body1">
                  <strong>Location:</strong> {data.location}
                </Typography>
                <Typography variant="body1">
                  <strong>Reserved slots:</strong> {data.attendees?.length}/
                  {data.tokenCount}
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ marginBottom: "0.75rem" }} variant="h6">
                  Attendees:
                </Typography>
                <AttendanceTable rows={rows} />
              </Box>
            </CardContent>
          </Card>
        ) : (
          // data === null
          <Typography variant="h6">Event not found!</Typography>
        )}
      </ContentWrapper>
    </Container>
  );
}

export default EventInfoPage;
