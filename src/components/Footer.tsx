import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  type IconDefinition,
  faGithub,
  faDiscord,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";

import {
  Box,
  Container,
  Link,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import config from "config";

type Info = {
  href: string;
  icon: IconDefinition;
};

const infos: Info[] = [
  {
    href: config.socials.discordUrl,
    icon: faDiscord,
  },
  {
    href: config.socials.githubUrl,
    icon: faGithub,
  },
  {
    href: config.socials.twitterUrl,
    icon: faXTwitter,
  },
];

function Footer() {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      id="footer"
      sx={{
        bottom: "0px",
        width: "100%",
        minHeight: "4.0rem",
        position: "absolute",
        paddingTop: "1.5rem",
        paddingBottom: "1.25rem",
      }}
    >
      <Container
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
        maxWidth="md"
      >
        <Typography
          sx={{ marginRight: "auto", color: "text.secondary" }}
          variant="body1"
        >
          © 2023 Proof of Attendance Protocol. All rights reserved.
        </Typography>
        <Stack direction="row" spacing={2}>
          {infos.map((info, index) => (
            <Link
              key={index}
              href={info.href}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                "&:hover .fa-flag": {
                  color: (theme) => theme.palette.primary.light,
                },
              }}
            >
              <FontAwesomeIcon
                className="fa-flag"
                icon={info.icon}
                color={theme.palette.text.secondary}
                size="xl"
              />
            </Link>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}

export default Footer;
