import axios from "axios";
import config from "config";

import type { Offer } from "types";
import { NetworkIdentifier } from "types";

export type getAllParams = {
  networkId: NetworkIdentifier;
  limit?: number;
};

export const getAll = async (
  jwt: string,
  params: getAllParams
): Promise<Offer[]> => {
  const response = await axios.get(
    new URL("/offers", config.apiURL).toString(),
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      responseType: "json",
      timeout: config.timeout,
      params: params,
    }
  );

  return response.data.result as Offer[];
};
