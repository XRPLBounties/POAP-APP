import axios from "axios";
import config from "config";

import type { Event, Claim, Minter } from "types";
import { NetworkIdentifier } from "types";

export type getMinterParams = {
  networkId: NetworkIdentifier;
};

export const getMinter = async (
  jwt: string,
  params: getMinterParams
): Promise<Minter> => {
  const response = await axios.get(
    new URL("/event/minter", config.apiURL).toString(),
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      responseType: "json",
      timeout: config.timeout,
      params: params,
    }
  );

  return response.data.result as Minter;
};

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
  maskedEventId: string;
  createOffer: boolean;
};

export const join = async (jwt: string, data: joinData): Promise<Claim> => {
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

  return response.data.result as Claim;
};

export type claimData = {
  maskedEventId: string;
};

export const claim = async (jwt: string, data: claimData): Promise<Claim | null> => {
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

  return response.data.result as Claim | null;
};

export type inviteData = {
  eventId: number;
  attendeeWalletAddresses: string[];
};

export const invite = async (
  jwt: string,
  data: inviteData
): Promise<boolean> => {
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

  return response.data.result as boolean;
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

export const getLink = async (
  jwt: string,
  id: string | number
): Promise<string> => {
  const response = await axios.get(
    new URL(`/event/link/${id}`, config.apiURL).toString(),
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      responseType: "json",
      timeout: config.timeout,
    }
  );

  return response.data.result as string;
};
