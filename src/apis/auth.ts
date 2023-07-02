import axios from "axios";
import config from "config";

import { WalletType } from "types";

export const heartbeat = async (): Promise<boolean> => {
  const response = await axios.get(
    new URL("/auth/heartbeat", config.apiURL).toString(),
    {
      responseType: "json",
      timeout: config.timeout,
    }
  );

  if (response.status === 200) {
    return response.data.result as boolean;
  }

  throw new Error(response.status.toString());
};

export type nonceData = {
  pubkey: string;
};

export const nonce = async (data: nonceData): Promise<string> => {
  const response = await axios.post(
    new URL("/auth/nonce", config.apiURL).toString(),
    data,
    {
      responseType: "json",
      timeout: config.timeout,
    }
  );

  if (response.status === 200) {
    return response.data.result as string;
  }

  throw new Error(response.status.toString());
};

export type loginData = {
  walletAddress: string;
  walletType: WalletType;
  data: string;
  signature?: string;
};

export const login = async (data: loginData): Promise<string> => {
  const response = await axios.post(
    new URL("/auth/login", config.apiURL).toString(),
    data,
    {
      responseType: "json",
      timeout: config.timeout,
    }
  );

  if (response.status === 200) {
    return response.data.result as string;
  }

  throw new Error(response.status.toString());
};

export type refreshResult = string | null;

export const refresh = async (jwt: string): Promise<refreshResult> => {
  const response = await axios.post(
    new URL("/auth/refresh", config.apiURL).toString(),
    {},
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      responseType: "json",
      timeout: config.timeout,
    }
  );

  if (response.status === 200) {
    return response.data.result as refreshResult;
  }

  throw new Error(`${response.status} ${response.data.error}`); // TODO want the actual message
};
