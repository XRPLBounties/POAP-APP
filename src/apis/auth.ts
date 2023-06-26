import axios from "axios";
import config from "config";

import { WalletType } from "types";

export type heartbeatResult = boolean;

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

export type preloginData = {
  walletAddress: string;
};

export type preloginResult = string;

export const prelogin = async (data: preloginData): Promise<preloginResult> => {
  const response = await axios.post(
    new URL("/auth/prelogin", config.apiURL).toString(),
    data,
    {
      responseType: "json",
      timeout: config.timeout,
    }
  );

  if (response.status === 200) {
    return response.data.result as preloginResult;
  }

  throw new Error(response.status.toString());
};

export type loginData = {
  walletAddress: string;
  walletType: WalletType;
  data: string;
};

export type loginResult = string;

export const login = async (data: loginData): Promise<loginResult> => {
  const response = await axios.post(
    new URL("/auth/login", config.apiURL).toString(),
    data,
    {
      responseType: "json",
      timeout: config.timeout,
    }
  );

  if (response.status === 200) {
    return response.data.result as loginResult;
  }

  throw new Error(response.status.toString());
};

export type refreshResult = boolean;

export const refresh = async (): Promise<refreshResult> => {
  const response = await axios.post(
    new URL("/auth/refresh", config.apiURL).toString(),
    {},
    {
      responseType: "json",
      timeout: config.timeout,
    }
  );

  if (response.status === 200) {
    return response.data.result as refreshResult;
  }

  throw new Error(response.status.toString());
};

export type logoutResult = boolean;

export const logout = async (): Promise<logoutResult> => {
  const response = await axios.post(
    new URL("/auth/logout", config.apiURL).toString(),
    {},
    {
      responseType: "json",
      timeout: config.timeout,
    }
  );

  if (response.status === 200) {
    return response.data.result as logoutResult;
  }

  throw new Error(response.status.toString());
};
