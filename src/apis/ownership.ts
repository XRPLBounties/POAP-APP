import axios from "axios";
import config from "config";

import type { NetworkIdentifier } from "types";

export type verifyParams = {
  networkId: NetworkIdentifier;
  ownerWalletAddress: string;
  maskedEventId: string;
};

export const verify = async (
  jwt: string,
  params: verifyParams
): Promise<boolean> => {
  const response = await axios.get(
    new URL("/ownership/verify", config.apiURL).toString(),
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      responseType: "json",
      timeout: 120000,
      params: params,
    }
  );

  return response.data.result as boolean;
};
