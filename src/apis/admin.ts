import axios from "axios";
import config from "config";

// TODO return type
export const getStats = async (
  jwt: string,
): Promise<boolean> => {
  const response = await axios.get(
    new URL("/admin/stats", config.apiURL).toString(),
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
