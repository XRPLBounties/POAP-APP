export enum DialogIdentifier {
  DIALOG_MINT,
  DIALOG_JOIN,
  DIALOG_PROFILE,
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
  title: string;
  uri: string;
  count: number;
  dateStart: string;
  dateEnd: string;
  networkId: number;
  ownerWalletAddress: string;
  owner?: User;
  attendees?: User[];
};

export type Metadata = {
  title: string,
  description: string,
  collectionSize: number,
  location: string,
  dateStart: string,
  dateEnd: string,
  uri: string,
  account: string,
};

