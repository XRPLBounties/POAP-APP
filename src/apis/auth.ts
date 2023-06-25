import axios from "axios";
import config from "config";

export type heartbeatResult = boolean

export const heartbeat = async (): Promise<heartbeatResult> => {
  const response = await axios.get(
    new URL("/heartbeat", config.apiURL).toString(),
    {
      responseType: "json",
      timeout: config.timeout,
    }
  );

  if (response.status === 200) {
    return response.data.result as heartbeatResult;
  }

  throw new Error(response.status.toString());
};
