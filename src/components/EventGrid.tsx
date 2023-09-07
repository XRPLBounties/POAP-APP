import * as React from "react";

import { Grid } from "@mui/material";
import { Event } from "types";
import EventCard from "./EventCard";

type EventGridProps = {
  events: Event[];
};

function EventGrid({ events }: EventGridProps) {
  return (
    <Grid container spacing={3}>
      {events.map((event, index) => (
        <Grid item xs={6} md={4} key={index}>
          <EventCard event={event} />
        </Grid>
      ))}
    </Grid>
  );
}

export default EventGrid;
