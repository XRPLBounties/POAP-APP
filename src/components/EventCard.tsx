import * as React from "react";
import { Link } from "react-router-dom";

import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Event } from "types";

type EventCardProps = {
  event: Event;
};

function EventCard({ event }: EventCardProps) {
  return (
    <Card>
      <CardActionArea disableRipple component={Link} to={`/event/${event.id}`}>
        <CardMedia
          component="img"
          height="140"
          image={event.imageUrl}
          alt="event image"
        />
        <CardContent>
          <Typography noWrap variant="h6" component="div">
            {event.title}
          </Typography>
          <Typography sx={{ mb: 1.5 }} variant="body2" color="text.secondary">
            Event #{event.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {event.description}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions disableSpacing>
        <Button size="small" color="primary">
          Share
        </Button>
        <Button size="small" color="primary">
          Cancel
        </Button>
        <IconButton>
          <WarningAmberIcon color="warning" />
        </IconButton>
      </CardActions>
    </Card>
  );
}

export default EventCard;
