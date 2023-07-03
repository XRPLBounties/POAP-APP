import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import type { GridColDef } from "@mui/x-data-grid";

import API from "apis";
import type { Event, Metadata } from "types";
import Loader from "components/Loader";
import DataTable from "components/DataTable";
import { useAuth } from "components/AuthContext";

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
          enqueueSnackbar(`Failed to load event data: ${err.response?.data.error}`, {
            variant: "error",
          });
        } else {
          enqueueSnackbar("Failed to load event data", {
            variant: "error",
          });
        }
      }
    };

    if (id) {
      load();
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
          enqueueSnackbar(`Failed to load event metadata: ${err.response?.data.error}`, {
            variant: "error",
          });
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

  const columns: GridColDef[] = [
    { field: "index", headerName: "#", width: 45, minWidth: 45 },
    { field: "address", headerName: "Wallet Address", width: 320 },
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "email",
      headerName: "Email",
      align: "center",
      sortable: false,
      filterable: false,
      width: 60,
      renderCell: (params) => {
        return (
          <React.Fragment>
            {params.row.emailAddress && (
              <Link
                target="_top"
                rel="noopener noreferrer"
                href={`mailto:${params.row.emailAddress}`}
              >
                <EmailOutlinedIcon />
              </Link>
            )}
          </React.Fragment>
        );
      },
    },
  ];

  const makeName = (first?: string, last?: string): string => {
    let result = "";
    if (first) {
      result += first;
    }
    if (last) {
      result += ` ${last}`;
    }
    return result.trim();
  };

  const rows = React.useMemo(() => {
    if (data && data.attendees) {
      return data.attendees.map((a, i) => ({
        id: i,
        index: i + 1,
        address: a.walletAddress,
        name: makeName(a.firstName, a.lastName),
        emailAddress: a.email,
      }));
    } else {
      return [];
    }
  }, [data]);

  return (
    <React.Fragment>
      <Box sx={{ width: "48rem" }}>
        <Paper sx={{ position: "relative", padding: "1.5rem" }} elevation={1}>
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
                    <Typography variant="body1">
                      {metadata.description}
                    </Typography>
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
                      <strong>Date Start:</strong> {metadata.dateStart}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Date End:</strong> {metadata.dateEnd}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Location:</strong> {metadata.location}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Reserved slots:</strong> {data.attendees?.length}/
                      {metadata.tokenCount}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ marginBottom: "0.75rem" }} variant="h6">
                      Attendees:
                    </Typography>
                    <DataTable columns={columns} rows={rows} />
                  </Box>
                </React.Fragment>
              ) : (
                <Loader />
              )}
            </React.Fragment>
          ) : data === null ? (
            <Typography variant="h6">Event not found!</Typography>
          ) : (
            <Loader />
          )}

          <IconButton
            sx={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              borderRadius: 5,
            }}
            title="Return to previous page"
            color="primary"
            onClick={() => navigate(-1)}
          >
            <ArrowBackRoundedIcon />
          </IconButton>
        </Paper>
      </Box>
    </React.Fragment>
  );
}

export default EventInfoPage;
