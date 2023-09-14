export type AuthData = {
  tempJwt: string;
};

export type ProviderRequestResult = {
  resolved: Promise<string | undefined>;
  uuid?: string;
}

export abstract class Provider {
  public abstract acceptOffer(offerIndex: string): Promise<ProviderRequestResult>;
  public abstract setAccount(minterAddress: string): Promise<ProviderRequestResult>;
  public abstract sendPayment(
    value: string,
    destination: string,
    memo?: string
  ): Promise<ProviderRequestResult>;
  public abstract getAuthData(): Promise<AuthData> | AuthData;
}
