import axios from "axios";
import config from "config";

import type { NetworkIdentifier } from "types";

export type checkData = {
  networkId: NetworkIdentifier;
  txHash: string;
};

export const check = async (jwt: string, data: checkData): Promise<boolean> => {
  const response = await axios.post(
    new URL("/payment/check", config.apiURL).toString(),
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
