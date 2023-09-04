import axios from "axios";
import config from "config";

import type { User } from "types";

export const getAddresses = async (jwt: string): Promise<string[]> => {
  const response = await axios.get(
    new URL("/users/lookup", config.apiURL).toString(),
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      responseType: "json",
      timeout: config.timeout,
    }
  );

  return response.data.result as string[];
};

export const getOrganizers = async (jwt: string): Promise<User[]> => {
  const response = await axios.get(
    new URL("/users/organizers", config.apiURL).toString(),
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      responseType: "json",
      timeout: config.timeout,
    }
  );

  return response.data.result as User[];
};
