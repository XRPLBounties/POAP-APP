import axios from "axios";
import config from "config";

export type mintParams = {
  walletAddress: string;
  tokenCount: number;
  url: string;
  title: string;
  desc: string;
  loc: string;
}

export type mintResult = {
  eventId: number;
  account: string;
  owner: string;
  URI: string;
  title: string;
  claimable: number;
}

export const mint = async (params: mintParams): Promise<mintResult> => {
  const response = await axios.get(
    new URL("/api/mint", config.apiURL).toString(),
    {
      responseType: "json",
      timeout: config.timeout,
      params: params,
    },
  );

  if (response.status === 200) {
    return response.data.result as mintResult;
  }

  throw new Error(response.status.toString());
};

export type claimParams = {
  walletAddress: string;
  type: number;
  minter: string;
  eventId: string | number;
}

export type claimResult = {
  status: string;
  result?: any;
  offer?: any;
  // TODO
}

export const claim = async (params: claimParams): Promise<claimResult> => {
  const response = await axios.get(
    new URL("/api/claim", config.apiURL).toString(),
    {
      responseType: "json",
      timeout: config.timeout,
      params: params,
    },
  );

  if (response.status === 200) {
    return response.data as claimResult;
  }

  throw new Error(response.status.toString());
};

export type startVerificationParams = {
  walletAddress: string;
}

export type startVerificationResult = string;

export const startVerification = async (params: startVerificationParams): Promise<startVerificationResult> => {
  const response = await axios.get(
    new URL("/api/startVerification", config.apiURL).toString(),
    {
      responseType: "json",
      timeout: config.timeout,
      params: params,
    },
  );

  if (response.status === 200) {
    return response.data.result as startVerificationResult;
  }

  throw new Error(response.status.toString());
};

export type verifyOwnershipParams = {
  walletAddress: string;
  signature: string;
  minter: string;
  eventId: string | number;
}

export type verifyOwnershipResult = {
  // TODO
}

export const verifyOwnership = async (params: verifyOwnershipParams): Promise<verifyOwnershipResult> => {
  const response = await axios.get(
    new URL("/api/verifyOwnership", config.apiURL).toString(),
    {
      responseType: "json",
      timeout: config.timeout,
      params: params,
    },
  );

  if (response.status === 200) {
    return response.data as verifyOwnershipResult;
  }

  throw new Error(response.status.toString());
};

export type attendeesParams = {
  minter: string;
  eventId: string | number;
}

type User = {
  user: string;
}

export type attendeesResult = {
  [index: number]: User;
  // TODO
}

export const attendees = async (params: attendeesParams): Promise<attendeesResult> => {
  const response = await axios.get(
    new URL("/api/attendees", config.apiURL).toString(),
    {
      responseType: "json",
      timeout: config.timeout,
      params: params,
    },
  );

  if (response.status === 200) {
    return response.data.result as attendeesResult;
  }

  throw new Error(response.status.toString());
};
