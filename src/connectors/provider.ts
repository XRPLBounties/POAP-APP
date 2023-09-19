export type AuthData = {
  tempJwt: string;
};

export type ProviderRequestResult = {
  resolved: Promise<string | undefined>;
  uuid?: string;
};

export abstract class Provider {
  public abstract acceptOffer(
    offerIndex: string,
    isMobile?: boolean
  ): Promise<ProviderRequestResult>;
  public abstract setAccount(
    minterAddress: string,
    isMobile?: boolean
  ): Promise<ProviderRequestResult>;
  public abstract sendPayment(
    value: string,
    destination: string,
    memo?: string,
    isMobile?: boolean
  ): Promise<ProviderRequestResult>;
  public abstract getAuthData(): Promise<AuthData> | AuthData;
}
