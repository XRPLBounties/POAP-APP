import { Connector } from "connectors/connector";

export class EmptyWallet extends Connector {

  public async activate(): Promise<void> {}

  public async deactivate(): Promise<void> {
    this.provider = undefined;
    this.state.reset();
  }
}

export const empty = new EmptyWallet();
