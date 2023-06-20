import axios from "axios";
import config from "config";
import type { NFTOffer } from "xrpl/dist/npm/models/common";

import type { Event } from "types";

export type mintParams = {
  walletAddress: string;
  tokenCount: number;
  url: string;
  title: string;
  desc: string;
  loc: string;
};

export type mintResult = {
  eventId: number;
  account: string;
  owner: string;
  URI: string;
  title: string;
  claimable: number;
};

export const mint = async (params: mintParams): Promise<mintResult> => {
  const response = await axios.get(
    new URL("/api/mint", config.apiURL).toString(),
    {
      responseType: "json",
      timeout: config.timeout,
      params: params,
    }
  );

  if (response.status === 200) {
    return response.data.result as mintResult;
  }

  throw new Error(response.status.toString());
};

export type claimParams = {
  walletAddress: string;
  type: string | number;
  eventId: string | number;
};

export type claimResult = {
  status: string;
  result?: string;
  offer?: NFTOffer;
};

export const claim = async (params: claimParams): Promise<claimResult> => {
  const response = await axios.get(
    new URL("/api/claim", config.apiURL).toString(),
    {
      responseType: "json",
      timeout: config.timeout,
      params: params,
    }
  );

  if (response.status === 200) {
    return response.data as claimResult;
  }

  throw new Error(response.status.toString());
};

export type startVerificationParams = {
  walletAddress: string;
};

export type startVerificationResult = string;

export const startVerification = async (
  params: startVerificationParams
): Promise<startVerificationResult> => {
  const response = await axios.get(
    new URL("/api/startVerification", config.apiURL).toString(),
    {
      responseType: "json",
      timeout: config.timeout,
      params: params,
    }
  );

  if (response.status === 200) {
    return response.data.result as startVerificationResult;
  }

  throw new Error(response.status.toString());
};

export type verifyOwnershipParams = {
  walletAddress: string;
  signature: string;
  minter: string;
  eventId: string | number;
};

export type verifyOwnershipResult = {
  // TODO
};

export const verifyOwnership = async (
  params: verifyOwnershipParams
): Promise<verifyOwnershipResult> => {
  const response = await axios.get(
    new URL("/api/verifyOwnership", config.apiURL).toString(),
    {
      responseType: "json",
      timeout: config.timeout,
      params: params,
    }
  );

  if (response.status === 200) {
    return response.data as verifyOwnershipResult;
  }

  throw new Error(response.status.toString());
};

export type eventsParams = {
  limit: string | number;
  includeAttendees: boolean | string | number;
};

export type eventsResult = Event[];

export const events = async (params: eventsParams): Promise<eventsResult> => {
  const response = await axios.get(
    new URL("/api/events", config.apiURL).toString(),
    {
      responseType: "json",
      timeout: config.timeout,
      params: params,
    }
  );

  if (response.status === 200) {
    return response.data.result as eventsResult;
  }

  throw new Error(response.status.toString());
};

export type eventParams = {
  id: string | number;
  includeAttendees: boolean | string | number;
};

export type eventResult = Event | undefined;

export const event = async (params: eventParams): Promise<eventResult> => {
  const { id, includeAttendees } = params;
  const response = await axios.get(
    new URL(`/api/event/${id}`, config.apiURL).toString(),
    {
      responseType: "json",
      timeout: config.timeout,
      params: { includeAttendees },
    }
  );

  if (response.status === 200) {
    return response.data.result as eventResult;
  }

  throw new Error(response.status.toString());
};
