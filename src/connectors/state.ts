import type { StoreApi } from "zustand";
import { createStore, useStore } from "zustand";

import { NetworkIdentifier } from "types";

type ConnectorState = {
  networkId?: NetworkIdentifier;
  account?: string;
  activating: boolean;
};

type ConnectorStore = StoreApi<ConnectorState>;

type ConnectorStateUpdate =
  | {
      networkId: NetworkIdentifier;
      account: string;
    }
  | {
      networkId: NetworkIdentifier;
      account?: never;
    }
  | {
      networkId?: never;
      account: string;
    };

const DEFAULT_STATE = {
  networkId: undefined,
  account: undefined,
  activating: false,
};

export class State {
  private nullifier: number;
  private store: ConnectorStore;

  constructor() {
    this.nullifier = 0;
    this.store = createStore<ConnectorState>(() => DEFAULT_STATE);
  }

  public startActivation(): () => void {
    const nullifierCached = ++this.nullifier;

    this.store.setState({ ...DEFAULT_STATE, activating: true });

    // return a function that cancels the activation iff nothing else has happened
    return () => {
      if (this.nullifier === nullifierCached) {
        this.store.setState({ activating: false });
      }
    };
  }

  public update(stateUpdate: ConnectorStateUpdate): void {
    this.nullifier++;
    this.store.setState((existingState): ConnectorState => {
      const networkId = stateUpdate.networkId ?? existingState.networkId;
      const account = stateUpdate.account ?? existingState.account;

      // ensure that the activating flag is cleared when appropriate
      let activating = existingState.activating;
      if (activating && networkId && account) {
        activating = false;
      }

      return { networkId, account, activating };
    });
  }

  public reset(): void {
    this.nullifier++;
    this.store.setState(DEFAULT_STATE);
  }

  public getNetworkId(): ConnectorState["networkId"] {
    return this.store.getState().networkId;
  }

  public getAccount(): ConnectorState["account"] {
    return this.store.getState().account;
  }

  public isActivating(): ConnectorState["activating"] {
    return this.store.getState().activating;
  }

  public isActive(): boolean {
    const networkId = this.getNetworkId();
    const accounts = this.getAccount();
    const activating = this.isActivating();

    return Boolean(networkId && accounts && !activating);
  }

  public getHooks() {
    const store = this.store;

    function useNetworkId(): ConnectorState["networkId"] {
      return useStore(store, (s) => s.networkId);
    }

    function useAccount(): ConnectorState["account"] {
      return useStore(store, (s) => s.account);
    }

    function useIsActivating(): ConnectorState["activating"] {
      return useStore(store, (s) => s.activating);
    }

    function useIsActive(): boolean {
      const networkId = useNetworkId();
      const accounts = useAccount();
      const activating = useIsActivating();

      return Boolean(networkId && accounts && !activating);
    }

    return { useNetworkId, useAccount, useIsActivating, useIsActive };
  }
}
