import React from "react";
import { useParams } from "react-router-dom";
import { useAtom } from "jotai";

import { Box, Container, Typography } from "@mui/material";

import API from "apis";
import { type Event } from "types";

import { activeDialogAtom } from "states/atoms";
import { useAuth } from "components/AuthContext";
import ContentWrapper from "components/ContentWrapper";
import EventInfoCard from "components/EventInfoCard";

function EventInfoPage() {
  const { jwt } = useAuth();
  const [activeDialog, setActiveDialog] = useAtom(activeDialogAtom);
  const [data, setData] = React.useState<Event | null>();
  const [maskedId, setMaskedId] = React.useState<string>();

  const { id } = useParams();
  const isMasked = isNaN(Number(id));

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const event = await API.event.getInfo(id!, jwt);
        let masked = id;
        if (jwt && !isMasked && event) {
          masked = await API.event.getLink(jwt, id!);
        }
        if (mounted) {
          setData(event || null);
          setMaskedId(masked);
        }
      } catch (err) {
        console.debug(err);
        if (mounted) {
          setData(null);
          setMaskedId(undefined);
        }
      }
    };

    // only update data, if no dialog is open
    if (!activeDialog.type) {
      if (id) {
        load();
      } else {
        setData(undefined);
        setMaskedId(undefined);
      }
    }

    return () => {
      mounted = false;
    };
  }, [activeDialog, id, jwt]);

  return (
    <Container maxWidth="md" disableGutters>
      <ContentWrapper isLoading={data === undefined} isAuthorized={true}>
        {data && maskedId ? (
          <EventInfoCard isBasic={isMasked} event={data} maskedId={maskedId} />
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
