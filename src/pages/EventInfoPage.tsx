import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import API from "apis";
import type { Event, Metadata } from "types";
import Loader from "components/Loader";

import { useAuth } from "components/AuthContext";
import AttendanceTable, { AttendanceTableRow } from "components/AttendeeTable";
import ContentWrapper from "components/ContentWrapper";

function EventInfoPage() {
  const { jwt } = useAuth();
  const [data, setData] = React.useState<Event | null | undefined>();
  const [metadata, setMetadata] = React.useState<Metadata>();
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

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await axios({
          method: "get",
          url: data?.uri,
        });

        if (mounted) {
          setMetadata(response.data as Metadata);
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
          setMetadata(undefined);
        }
        if (axios.isAxiosError(err)) {
          enqueueSnackbar(
            `Failed to load event metadata: ${err.response?.data.error}`,
            {
              variant: "error",
            }
          );
        } else {
          enqueueSnackbar("Failed to load event metadata", {
            variant: "error",
          });
        }
      }
    };

    if (data) {
      load();
    } else {
      setMetadata(undefined);
    }

    return () => {
      mounted = false;
    };
  }, [data]);

  const rows = React.useMemo<AttendanceTableRow[]>(() => {
    if (data && data.attendees) {
      return data.attendees.map((a, i) => ({
        id: i,
        index: i + 1,
        walletAddress: a.walletAddress,
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
      }));
    } else {
      return [];
    }
  }, [data]);

  return (
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
        <React.Fragment>
          <Box
            sx={{
              marginBottom: "0.75rem",
            }}
          >
            <Typography
              sx={{ marginRight: "4rem", fontWeight: "bold" }}
              variant="h5"
            >
              {data.title}
            </Typography>
            <Typography
              sx={{
                marginBottom: "0.75rem",
                color: "lightgray",
                fontStyle: "italic",
              }}
              variant="h6"
            >{`Event #${data.id}`}</Typography>
          </Box>

          {metadata ? (
            <React.Fragment>
              <Box
                sx={{
                  marginBottom: "0.75rem",
                }}
              >
                <Box
                  component="img"
                  sx={{
                    maxHeight: 350,
                    maxWidth: "45rem",
                    marginBottom: "0.75rem",
                  }}
                  alt="event banner"
                  src={metadata.imageUrl}
                />
                <Typography variant="body1">{metadata.description}</Typography>
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
                  {new Date(metadata.dateStart).toString()}
                </Typography>
                <Typography variant="body1">
                  <strong>Date End:</strong>{" "}
                  {new Date(metadata.dateEnd).toString()}
                </Typography>
                <Typography variant="body1">
                  <strong>Location:</strong> {metadata.location}
                </Typography>
                <Typography variant="body1">
                  <strong>Reserved slots:</strong> {data.attendees?.length}/
                  {metadata.tokenCount}
                </Typography>
              </Box>
            </React.Fragment>
          ) : (
            <Loader />
          )}

          <Box>
            <Typography sx={{ marginBottom: "0.75rem" }} variant="h6">
              Attendees:
            </Typography>
            <AttendanceTable rows={rows} />
          </Box>
        </React.Fragment>
      ) : (
        // data === null
        <Typography variant="h6">Event not found!</Typography>
      )}
    </ContentWrapper>
  );
}

export default EventInfoPage;
