export abstract class Provider {
  public abstract signMessage(message: string): Promise<string> | string;
  public abstract acceptOffer(offerIndex: string): Promise<boolean> | boolean;
}