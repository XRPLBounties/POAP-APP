import axios from "axios";
import config from "config";
import type { NFTOffer } from "xrpl/dist/npm/models/common";

import type { Event, User } from "types";
import { NetworkIdentifier } from "types";

export type mintData = {
  networkId: NetworkIdentifier,
  walletAddress: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  tokenCount: number;
  dateStart: Date,
  dateEnd: Date,
  isManaged: boolean,
};

export type mintResult = {
  eventId: number;
  metadataUri: string;
};

export const mint = async (data: mintData): Promise<mintResult> => {
  const response = await axios.post(
    new URL("/api/mint", config.apiURL).toString(),
    data,
    {
      responseType: "json",
      timeout: 600000,
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
  walletAddress: string;
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
