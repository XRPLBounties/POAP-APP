export enum DialogIdentifier {
  DIALOG_ADD,
  DIALOG_CANCEL,
  DIALOG_CLAIM,
  DIALOG_CREATE,
  DIALOG_JOIN,
  DIALOG_LINK,
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
  PENDING,
  PAID,
  ACTIVE,
  CANCELED,
  CLOSED,
  REFUNDED,
}

export type User = {
  walletAddress: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isOrganizer: boolean;
  isAdmin: boolean;
  slots: number;
  events?: Event[];
  attendances?: Event[];
  claims?: Claim[];
};

export type Accounting = {
  id: number;
  depositAddress: string;
  depositReserveValue: string;
  depositFeeValue: string;
  depositTxHash?: string;
  refundValue?: string;
  refundTxHash?: string;
  accumulatedTxFees: number;
  eventId: Event["id"];
  event?: Event;
};

export type Event = {
  id: number;
  status: EventStatus;
  networkId: NetworkIdentifier;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  uri: string;
  tokenCount: number;
  dateStart: string;
  dateEnd: string;
  isManaged: boolean;
  ownerWalletAddress: User["walletAddress"];
  owner?: User;
  accounting?: Accounting;
  attendees?: User[];
  nfts?: NFT[];
};

export type NFT = {
  id: string;
  issuerWalletAddress: User["walletAddress"];
  issuer?: User;
  eventId: Event["id"];
  event: Event;
  claim?: Claim;
};

export type Claim = {
  id: number;
  offerIndex: string | null;
  claimed: boolean;
  ownerWalletAddress: User["walletAddress"];
  owner?: User;
  tokenId: NFT["id"];
  token: NFT;
};

export type Minter = {
  walletAddress: string;
  isConfigured: boolean;
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

export type PlatformStats = {
  users: {
    total: number;
    organizers: number;
  };
  events: {
    total: number;
    pending: number;
    active: number;
    finished: number;
  };
  account: {
    balance: string;
    reserve: string;
  };
};

export type JwtPayload = {
  exp: number;
  walletAddress: string;
  permissions: string[];
  refreshable: boolean;
};
