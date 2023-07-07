import { Connector } from "connectors/connector";
import { ConnectorType } from "types";

export class EmptyWallet extends Connector {
  public getType(): ConnectorType {
    return ConnectorType.EMPTY;
  }

  public async activate(): Promise<void> {}

  public async deactivate(): Promise<void> {
    this.provider = undefined;
    this.state.reset();
  }
}

export const empty = new EmptyWallet();
