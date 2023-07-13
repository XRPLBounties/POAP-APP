import axios from "axios";
import config from "config";

export const getAll = async (
  jwt: string,
): Promise<string[]> => {
  const response = await axios.get(
    new URL("/users", config.apiURL).toString(),
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
