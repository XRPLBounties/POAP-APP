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

  return response.data.result as boolean;
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

  return response.data.result as string;
};

export type loginData = {
  walletAddress: string;
  walletType: WalletType;
  data: string;
  signature?: string;
  claimFlow: boolean;
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

  return response.data.result as string;
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

  return response.data.result as refreshResult;
};
