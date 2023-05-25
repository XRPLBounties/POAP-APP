// TODO
export abstract class Provider {

  public async sendTransaction(): Promise<string> {
    return "";
  }

  public async signMessage(message: string): Promise<string> {
    return "";
  }

}
