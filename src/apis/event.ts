import axios from "axios";
import config from "config";

import type { Event, Offer } from "types";
import { NetworkIdentifier } from "types";

export type createData = {
  networkId: NetworkIdentifier;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  tokenCount: number;
  dateStart: Date;
  dateEnd: Date;
  isManaged: boolean;
};

export type createResult = {
  eventId: number;
  metadataUri: string;
};

export const create = async (
  jwt: string,
  data: createData
): Promise<createResult> => {
  const response = await axios.post(
    new URL("/event/create", config.apiURL).toString(),
    data,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      responseType: "json",
      timeout: 600000,
    }
  );

  return response.data.result as createResult;
};

export type joinData = {
  eventId: number;
};

export const join = async (jwt: string, data: joinData): Promise<Offer> => {
  const response = await axios.post(
    new URL("/event/join", config.apiURL).toString(),
    data,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      responseType: "json",
      timeout: 10000,
    }
  );

  return response.data.result as Offer;
};

export type claimData = {
  eventId: number;
};

export const claim = async (jwt: string, data: claimData): Promise<Offer> => {
  const response = await axios.post(
    new URL("/event/claim", config.apiURL).toString(),
    data,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      responseType: "json",
      timeout: 10000,
    }
  );

  return response.data.result as Offer;
};

export type inviteData = {
  eventId: number;
  attendeeWalletAddresses: string[];
};

export type inviteResult = boolean;

export const invite = async (
  jwt: string,
  data: inviteData
): Promise<inviteResult> => {
  const response = await axios.post(
    new URL("/event/invite", config.apiURL).toString(),
    data,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      responseType: "json",
      timeout: 600000,
    }
  );

  return response.data.result as inviteResult;
};

export type getInfoResult = Event | undefined;

export const getInfo = async (
  id: string | number,
  jwt?: string
): Promise<getInfoResult> => {
  const response = await axios.get(
    new URL(`/event/info/${id}`, config.apiURL).toString(),
    {
      ...(jwt
        ? {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        : {}),
      responseType: "json",
      timeout: config.timeout,
    }
  );

  return response.data.result as getInfoResult;
};