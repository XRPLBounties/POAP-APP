import React from "react";
import axios from "axios";

import { useSnackbar } from "notistack";
import { QRCodeCanvas } from "qrcode.react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { saveAs } from "file-saver";

import { Box, IconButton, Tooltip, Button } from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CircularProgress from "@mui/material/CircularProgress";

import API from "apis";
import { useAuth } from "components/AuthContext";
import Loader from "components/Loader";
import { StepProps } from "./types";
import InfoBox from "components/InfoBox";

function SummaryStep({
  active,
  loading,
  eventId,
  setLoading,
  setError,
  setComplete,
  setActions,
}: StepProps) {
  const { isAuthenticated, jwt, permissions } = useAuth();
  const [data, setData] = React.useState<string>();
  const [copied, setCopied] = React.useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  const isAuthorized = React.useMemo(() => {
    return isAuthenticated && permissions.includes("organizer");
  }, [isAuthenticated, permissions]);

  // update parent state
  React.useEffect(() => {
    if (active) {
      setComplete(Boolean(data));
    }
  }, [active, data]);

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (jwt && eventId) {
          const masked = await API.event.getLink(jwt, eventId);
          if (mounted) {
            setData(`${window.location.origin}/claim/${masked}`);
          }
        }
      } catch (err) {
        console.debug(err);
        if (mounted) {
          setData(undefined);
        }
        if (axios.isAxiosError(err)) {
          enqueueSnackbar(
            `Failed to load event link: ${err.response?.data.error}`,
            {
              variant: "error",
            }
          );
        } else {
          enqueueSnackbar("Failed to load event link", {
            variant: "error",
          });
        }
      }
    };

    if (isAuthorized && active) {
      load();
    } else {
      setData(undefined);
    }

    return () => {
      mounted = false;
    };
  }, [active, eventId, jwt, isAuthorized]);

  const handleConfirm = React.useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      // TODO reset local state
      // setData(undefined);
    },
    []
  );

  const handleDownload = React.useCallback(() => {
    const canvas = document.getElementById("qrcode") as HTMLCanvasElement;
    if (canvas) {
      canvas.toBlob((blob) => {
        saveAs(blob!, "qr.png");
      });
    }
  }, []);

  // set actions
  React.useEffect(() => {
    if (active) {
      setActions([
        <Button
          color="primary"
          onClick={handleDownload}
          startIcon={loading && <CircularProgress size={20} />}
          disabled={loading || !Boolean(data)}
        >
          Save
        </Button>,
      ]);
    } else {
      setActions([]);
    }
  }, [active, loading, data, handleConfirm, handleDownload]);

  return active ? (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {data ? (
        <React.Fragment>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <QRCodeCanvas
              id="qrcode"
              size={300}
              level="H"
              value={data}
              includeMargin={true}
            />
          </Box>
          <Box
            sx={{
              bgcolor: (theme) => theme.palette.grey[100],
              border: "1px solid",
              borderRadius: "4px",
              borderColor: (theme) => theme.palette.grey[300],
              padding: "0.75rem",
              marginTop: "1rem",
              position: "relative",
            }}
          >
            <Box
              sx={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                marginRight: "2rem",
              }}
            >
              {data}
            </Box>
            <Box
              sx={{
                position: "absolute",
                right: "0.5rem",
                top: "50%",
                transform: "translate(0, -50%)",
              }}
            >
              <CopyToClipboard text={data} onCopy={() => setCopied(true)}>
                <Tooltip
                  title={copied ? "Copied" : "Copy Link"}
                  onClose={() => setCopied(false)}
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: (theme) =>
                          copied ? theme.palette.success.light : null,
                      },
                    },
                  }}
                >
                  <IconButton size="small">
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </CopyToClipboard>
            </Box>
          </Box>
          <InfoBox
            sx={{ marginTop: "1rem" }}
            text={"The QR code and link can later be found in the dashboard"}
          />
        </React.Fragment>
      ) : (
        <Loader text="Fetching link" />
      )}
    </Box>
  ) : null;
}

export default SummaryStep;
