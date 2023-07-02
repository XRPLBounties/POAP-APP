import axios from "axios";
import config from "config";

import type { Event } from "types";
import { NetworkIdentifier } from "types";

export type getPublicParams = {
  networkId: NetworkIdentifier;
  limit?: number;
};

export const getPublic = async (params: getPublicParams): Promise<Event[]> => {
  const response = await axios.get(
    new URL("/events/public", config.apiURL).toString(),
    {
      responseType: "json",
      timeout: config.timeout,
      params: params,
    }
  );

  if (response.status === 200) {
    return response.data.result as Event[];
  }

  throw new Error(response.status.toString());
};

export type getOwnedParams = {
  networkId: NetworkIdentifier;
  limit?: number;
  includeAttendees?: boolean;
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

  if (response.status === 200) {
    return response.data.result as Event[];
  }

  throw new Error(response.status.toString());
};
