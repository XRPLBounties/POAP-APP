import React from "react";

import { Card, CardContent, Grid, Typography } from "@mui/material";

import ContentWrapper from "components/ContentWrapper";
import Web3Status from "components/Web3Status";

type Feature = {
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    title: "Blockchain-Powered Security",
    description:
      "Our PoA system leverages the blockchain to ensure tamper-proof and verifiable records of attendance.",
  },
  {
    title: "Easy to use",
    description: "POAP is designed from the ground up to be easy to use.",
  },
  {
    title: "Trust and Transparency",
    description:
      "Build trust with your attendees by offering a verifiable Proof of Attendance, enhancing the credibility of your events.",
  },
  {
    title: "Non-Fungible Token (NFT)",
    description:
      "These tokens serve as evidence that an individual attended a particular event.",
  },
  {
    title: "Effortless Verification",
    description:
      "Our PoA system automates the attendance tracking process, making it quick and hassle-free.",
  },
  {
    title: "TODO",
    description: "any ideas?",
  },
];

function HomePage() {
  return (
    <ContentWrapper isLoading={false} isAuthorized={true}>
      <Grid
        sx={{ marginBottom: "2rem" }}
        container
        rowSpacing={4.5}
        columnSpacing={2.75}
      >
        <Grid item xs={12} md={6}>
          <Typography sx={{ paddingBottom: "18px" }} variant="h3">
            Welcome to POAP
          </Typography>
          <Typography sx={{ paddingBottom: "32px" }} variant="h6">
            Are you ready to revolutionize the way you manage attendance at your
            events? Look no further! We are your one-stop destination for all
            your decentralized event planning needs, and we're proud to
            introduce our cutting-edge Proof of Attendance (PoA) system powered
            by blockchain technology and built on the XRP Ledger. Connect a
            wallet to get started.
          </Typography>
          <Web3Status />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6">TODO Image?</Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography
            sx={{ marginTop: 12, marginBottom: -2.25 }}
            variant="h4"
            align="center"
          >
            Features you will enjoy the most
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" align="center">
            POAP has everything you need to organize events with verifiable
            attendance
          </Typography>
        </Grid>
        {features.map((f, index) => (
          <Grid key={index} item xs={12} sm={6} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ minHeight: "220px" }}>
                <Typography
                  sx={{ marginTop: "24px", marginBottom: "16px" }}
                  variant="h5"
                  align="center"
                >
                  {f.title}
                </Typography>
                <Typography
                  sx={{ marginTop: "24px", marginBottom: "24px" }}
                  align="center"
                  color="text.secondary"
                >
                  {f.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </ContentWrapper>
  );
}

export default HomePage;
