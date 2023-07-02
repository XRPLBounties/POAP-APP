import axios from "axios";
import config from "config";

import type { User } from "types";

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

  if (response.status === 200) {
    return response.data.result as User;
  }

  throw new Error(response.status.toString());
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

  if (response.status === 200) {
    return response.data.result as boolean;
  }

  throw new Error(response.status.toString());
};
