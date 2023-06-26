export enum DialogIdentifier {
  DIALOG_MINT,
  DIALOG_JOIN,
  DIALOG_PROFILE,
}

export enum NetworkIdentifier {
  UNKNOWN,
  MAINNET,
  TESTNET,
  DEVNET,
  AMM_DEVNET,
}

export enum WalletType {
  XUMM_WALLET,
  GEM_WALLET,
}

export enum ConnectorType {
  EMPTY = "EMPTY",
  XUMM = "XUMM",
  GEM = "GEM",
}

export type User = {
  walletAddress: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isOrganizer: boolean;
};

export type Event = {
  id: number;
  networkId: number;
  title: string;
  description: string;
  location: string,
  uri: string;
  tokenCount: number;
  dateStart: string;
  dateEnd: string;
  isManaged: boolean,
  ownerWalletAddress: string;
  owner?: User;
  attendees?: User[];
};

export type Metadata = {
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  tokenCount: number;
  dateStart: string;
  dateEnd: string;
};
