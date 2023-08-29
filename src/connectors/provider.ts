export type AuthData = {
  tempJwt: string;
};

export abstract class Provider {
  public abstract acceptOffer(offerIndex: string): Promise<boolean> | boolean;
  public abstract setAccount(minterAddress: string): Promise<boolean> | boolean;
  public abstract sendPayment(
    amount: string,
    destination: string,
    memo?: string
  ): Promise<boolean> | boolean;
  public abstract getAuthData(): Promise<AuthData> | AuthData;
}
