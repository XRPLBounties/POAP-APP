import axios from "axios";
import config from "config";

import type { Event } from "types";
import { NetworkIdentifier } from "types";

export type getAllParams = {
  networkId: NetworkIdentifier;
  limit?: number;
};

export const getAll = async (
  jwt: string,
  params: getAllParams
): Promise<Event[]> => {
  const response = await axios.get(
    new URL("/events/all", config.apiURL).toString(),
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      responseType: "json",
      timeout: config.timeout,
      params: params,
    }
  );

  return response.data.result as Event[];
};

export type getOwnedParams = {
  networkId: NetworkIdentifier;
  limit?: number;
};

export const getOwned = async (
  jwt: string,
  params: getOwnedParams
): Promise<Event[]> => {
  const response = await axios.get(
    new URL("/events/owned", config.apiURL).toString(),
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      responseType: "json",
      timeout: config.timeout,
      params: params,
    }
  );

  return response.data.result as Event[];
};
