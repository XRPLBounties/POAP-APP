import axios from "axios";
import config from "config";

import type { Event, Offer } from "types";
import { NetworkIdentifier } from "types";

export type mintData = {
  networkId: NetworkIdentifier;
  walletAddress: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  tokenCount: number;
  dateStart: Date;
  dateEnd: Date;
  isManaged: boolean;
};

export type mintResult = {
  eventId: number;
  metadataUri: string;
};

export const mint = async (data: mintData): Promise<mintResult> => {
  const response = await axios.post(
    new URL("/event/create", config.apiURL).toString(),
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

export type claimData = {
  walletAddress: string;
  eventId: number;
};

export type claimResult = Offer;

export const claim = async (data: claimData): Promise<claimResult> => {
  const response = await axios.post(
    new URL("/event/claim", config.apiURL).toString(),
    data,
    {
      responseType: "json",
      timeout: 60000,
    }
  );

  if (response.status === 200) {
    return response.data.result as claimResult;
  }

  throw new Error(response.status.toString());
};

export type getEventsParams = {
  networkId: NetworkIdentifier;
  limit: number;
};

export type getEventsResult = Event[];

export const getEvents = async (
  params: getEventsParams
): Promise<getEventsResult> => {
  const response = await axios.get(
    new URL("/events/public", config.apiURL).toString(),
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
  id: number;
  includeAttendees: boolean;
};

export type getEventResult = Event | undefined;

export const getEvent = async (
  params: getEventParams
): Promise<getEventResult> => {
  const { id, includeAttendees } = params;
  const response = await axios.get(
    new URL(`/event/info/${id}`, config.apiURL).toString(),
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
