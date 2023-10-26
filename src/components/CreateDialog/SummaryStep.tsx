import React from "react";
import axios from "axios";

import { useSnackbar } from "notistack";
import { QRCodeCanvas } from "qrcode.react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { saveAs } from "file-saver";

import { Box, IconButton, Tooltip, Button } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import API from "apis";
import { useAuth } from "components/AuthContext";
import Loader from "components/Loader";
import { StepProps } from "./types";
import InfoBox from "components/InfoBox";
import ContentBox from "../ContentBox";

function SummaryStep({
  active,
  eventId,
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
            setError(null);
            setData(`${window.location.origin}/claim/${masked}`);
          }
        }
      } catch (err) {
        const msg = "Failed to load event link";
        console.debug(err);
        if (mounted) {
          setError(msg);
          setData(undefined);
        }
        if (axios.isAxiosError(err)) {
          enqueueSnackbar(`${msg}: ${err.response?.data.error}`, {
            variant: "error",
          });
        } else {
          enqueueSnackbar(`${msg}: ${(err as Error).message}`, {
            variant: "error",
          });
        }
      }
    };

    if (active && isAuthorized) {
      load();
    } else {
      setData(undefined);
    }

    return () => {
      mounted = false;
    };
  }, [active, eventId, jwt, isAuthorized]);

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
          disabled={!Boolean(data)}
        >
          Save
        </Button>,
      ]);
    } else {
      setActions([]);
    }
  }, [active, data, handleDownload]);

  return active ? (
    <Box>
      <InfoBox sx={{ marginBottom: "1rem" }}>
        The QR code and link can also be viewed in the dashboard.
      </InfoBox>

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
          <ContentBox
            sx={{
              padding: "0.75rem",
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
          </ContentBox>
        </React.Fragment>
      ) : (
        <Loader text="Generating Link..." />
      )}
    </Box>
  ) : null;
}

export default SummaryStep;
