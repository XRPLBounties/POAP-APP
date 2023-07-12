import axios from "axios";
import config from "config";

import type { NetworkIdentifier, User } from "types";

export type getInfoParams = {
  includeEvents?: boolean;
};

export const getInfo = async (
  jwt: string,
  params: getInfoParams
): Promise<User> => {
  const response = await axios.get(
    new URL("/user/info", config.apiURL).toString(),
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      responseType: "json",
      timeout: config.timeout,
      params: params,
    }
  );

  return response.data.result as User;
};

export type updateData = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

export const update = async (
  jwt: string,
  data: updateData
): Promise<boolean> => {
  const response = await axios.post(
    new URL("/user/update", config.apiURL).toString(),
    data,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      responseType: "json",
      timeout: config.timeout,
    }
  );

  return response.data.result as boolean;
};

export type getSlotsParams = {
  networkId: NetworkIdentifier;
};

export type getSlotsResult = [number, number];

export const getSlots = async (
  jwt: string,
  params: getSlotsParams
): Promise<getSlotsResult> => {
  const response = await axios.get(
    new URL("/user/slots", config.apiURL).toString(),
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      responseType: "json",
      timeout: config.timeout,
      params: params,
    }
  );

  return response.data.result as getSlotsResult;
};
