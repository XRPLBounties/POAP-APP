import { Provider } from "connectors/provider";
import { State } from "connectors/state";
import { ConnectorType } from "types";

export abstract class Connector {
  public provider?: Provider;

  public readonly state: State;
  protected onError?: (error: Error) => void;

  constructor(onError?: (error: Error) => void) {
    this.state = new State();
    this.onError = onError;
  }

  public abstract getType(): ConnectorType;

  public reset(): Promise<void> | void {
    this.state.reset();
  }

  public abstract activate(...args: unknown[]): Promise<void> | void;

  public deactivate?(...args: unknown[]): Promise<void> | void;
}
