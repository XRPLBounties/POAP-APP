import axios from "axios";
import config from "config";

import type { NetworkIdentifier, PlatformStats } from "types";

export type getStatsParams = {
  networkId: NetworkIdentifier;
};

export const getStats = async (
  jwt: string,
  params: getStatsParams
): Promise<PlatformStats> => {
  const response = await axios.get(
    new URL("/admin/stats", config.apiURL).toString(),
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      responseType: "json",
      timeout: config.timeout,
      params: params,
    }
  );

  return response.data.result as PlatformStats;
};
