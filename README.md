# POAP-APP

The web app for Proof of Attendance Protocol

# Overview

This is the dApp for the XRPL POAP API.

Please note that everything in this repo is the work in progress and is subjected to change.

# Features

- Support for XUMM and Gem Wallet
- Creating new events
- Claiming NFT for selected event
- Verifying wallet ownership
- Looking up attendees for particular event

# Setup

That setup assumes user have already installed the [server](https://github.com/JustAnotherDevv/AttendifyXRPL) locally and it's running on `port 4000`.

- install dependences using `npm i`.
- open [xumm developer console](https://apps.xumm.dev) in order to create new app, then set its `Origin/Redirect URI` to `http://localhost:3000`.
- copy content of file `.env.example` to `.env` file and set `VITE_XUMM_API_KEY` to your XUMM project API Key taken from XUMM developer platform.
- run the dApp using `npm run dev`.
