import React from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import { Box, Stack, Typography } from "@mui/material";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

import API from "apis";
import { StepProps } from "./types";
import { useAuth } from "components/AuthContext";
import { useWeb3 } from "connectors/context";
import Loader from "components/Loader";
import LabeledContentBox from "components/LabeledContentBox";

function SummaryStep({
  active,
  ownerWalletAddress,
  setComplete,
  setError,
}: StepProps) {
  const { account, networkId } = useWeb3();
  const { jwt } = useAuth();
  const [data, setData] = React.useState<boolean>();
  const { id } = useParams();

  // update parent state
  React.useEffect(() => {
    if (active) {
      setComplete(data !== undefined);
    }
  }, [active, data]);

  // load ownership data
  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (jwt && networkId && id && ownerWalletAddress) {
          const isParticipant = await API.ownership.verify(jwt, {
            networkId,
            ownerWalletAddress,
            maskedEventId: id,
          });
          if (mounted) {
            setData(isParticipant);
          }
        }
      } catch (err) {
        console.debug(err);
        const msg = "Failed to load ownership data";
        if (mounted) {
          setData(undefined);
        }
        if (axios.isAxiosError(err)) {
          setError(`${msg}: ${err.response?.data.error}`);
        } else {
          setError(`${msg}: ${(err as Error).message}`);
        }
      }
    };

    // only update data, if no dialog is open
    if (active) {
      load();
    } else {
      setData(undefined);
    }

    return () => {
      mounted = false;
    };
  }, [active, jwt, networkId, id, ownerWalletAddress]);

  return active ? (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {data !== undefined ? (
        <React.Fragment>
          <Stack
            sx={{ marginBottom: "2rem" }}
            direction="row"
            alignItems="center"
            gap={1}
          >
            {data ? (
              <React.Fragment>
                <TaskAltIcon fontSize="large" color="success" />
                <Typography align="center" variant="h6" color="text.secondary">
                  Participant!
                </Typography>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <HighlightOffIcon fontSize="large" color="error" />
                <Typography align="center" variant="h6" color="text.secondary">
                  NOT a Participant!
                </Typography>
              </React.Fragment>
            )}
          </Stack>
          <LabeledContentBox
            title="Wallet Address:"
            sx={{
              marginBottom: "0.75rem",
              wordBreak: "break-all",
            }}
          >
            {account}
          </LabeledContentBox>
        </React.Fragment>
      ) : (
        <Loader />
      )}
    </Box>
  ) : null;
}

export default SummaryStep;
