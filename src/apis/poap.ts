import axios from "axios";
import config from "config";
import type { NFTOffer } from "xrpl/dist/npm/models/common";

import type { Event, User } from "types";

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
      timeout: 600000,
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
      timeout: 60000,
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

export type getEventsParams = {
  limit: string | number;
  includeAttendees: boolean | string | number;
};

export type getEventsResult = Event[];

export const getEvents = async (
  params: getEventsParams
): Promise<getEventsResult> => {
  const response = await axios.get(
    new URL("/api/events", config.apiURL).toString(),
    {
      responseType: "json",
      timeout: config.timeout,
      params: params,
    }
  );

  if (response.status === 200) {
    return response.data.result as getEventsResult;
  }

  throw new Error(response.status.toString());
};

export type getEventParams = {
  id: string | number;
  includeAttendees: boolean | string | number;
};

export type getEventResult = Event | undefined;

export const getEvent = async (params: getEventParams): Promise<getEventResult> => {
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
    return response.data.result as getEventResult;
  }

  throw new Error(response.status.toString());
};

export type getUserParams = {
  walletAddress: string | number;
  includeEvents: boolean | string | number;
};

export type getUserResult = User | undefined;

export const getUser = async (params: getUserParams): Promise<getUserResult> => {
  const { walletAddress, includeEvents } = params;
  const response = await axios.get(
    new URL(`/api/user/${walletAddress}`, config.apiURL).toString(),
    {
      responseType: "json",
      timeout: config.timeout,
      params: { includeEvents },
    }
  );

  if (response.status === 200) {
    return response.data.result as getUserResult;
  }

  throw new Error(response.status.toString());
};

export type updateUserData = {
  walletAddress: string | number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

export type updateUserResult = boolean;

export const updateUser = async (
  data: updateUserData
): Promise<updateUserResult> => {
  const response = await axios.post(
    new URL("/api/updateUser", config.apiURL).toString(),
    data,
    {
      responseType: "json",
      timeout: config.timeout,
    }
  );

  if (response.status === 200) {
    return response.data.result as updateUserResult;
  }

  throw new Error(response.status.toString());
};
