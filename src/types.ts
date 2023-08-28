export enum DialogIdentifier {
  DIALOG_ADD,
  DIALOG_CLAIM,
  DIALOG_JOIN,
  DIALOG_LINK,
  DIALOG_MINT,
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

export enum EventStatus {
  ACTIVE,
  CLOSED,
  CANCELED,
}

export type User = {
  walletAddress: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isOrganizer: boolean;
  slots: number;
};

export type Minter = {
  walletAddress: string;
  isConfigured: boolean;
};

export type Event = {
  id: number;
  status: EventStatus;
  networkId: NetworkIdentifier;
  title: string;
  description: string;
  location: string;
  uri: string;
  tokenCount: number;
  dateStart: string;
  dateEnd: string;
  isManaged: boolean;
  ownerWalletAddress: User["walletAddress"];
  owner?: User;
  attendees?: User[];
};

export type NFT = {
  id: string;
  issuerWalletAddress: User["walletAddress"];
  eventId: Event["id"];
  issuer?: User;
  event: Event;
};

export type Offer = {
  id: number;
  ownerWalletAddress: User["walletAddress"];
  tokenId: NFT["id"];
  offerIndex: string | null;
  claimed: boolean;
  owner?: User;
  token: NFT;
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

export type JwtPayload = {
  exp: number;
  walletAddress: string;
  permissions: string[];
  refreshable: boolean;
};
