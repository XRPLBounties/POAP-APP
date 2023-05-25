import type { StoreApi } from "zustand";
import { createStore, useStore } from "zustand";

import { ChainIdentifier } from "connectors/chain";

type ConnectorState = {
  chainId?: ChainIdentifier;
  account?: string;
  activating: boolean;
};

type ConnectorStore = StoreApi<ConnectorState>;

type ConnectorStateUpdate =
  | {
      chainId: ChainIdentifier;
      account: string;
    }
  | {
      chainId: ChainIdentifier;
      account?: never;
    }
  | {
      chainId?: never;
      account: string;
    };

const DEFAULT_STATE = {
  chainId: undefined,
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
      const chainId = stateUpdate.chainId ?? existingState.chainId;
      const account = stateUpdate.account ?? existingState.account;

      // ensure that the activating flag is cleared when appropriate
      let activating = existingState.activating;
      if (activating && chainId && account) {
        activating = false;
      }

      return { chainId, account, activating };
    });
  }

  public reset(): void {
    this.nullifier++;
    this.store.setState(DEFAULT_STATE);
  }

  public getChainId(): ConnectorState["chainId"] {
    return this.store.getState().chainId;
  }

  public getAccount(): ConnectorState["account"] {
    return this.store.getState().account;
  }

  public isActivating(): ConnectorState["activating"] {
    return this.store.getState().activating;
  }

  public isActive(): boolean {
    const chainId = this.getChainId();
    const accounts = this.getAccount();
    const activating = this.isActivating();

    return Boolean(chainId && accounts && !activating);
  }

  public getHooks() {
    const store = this.store;

    function useChainId(): ConnectorState["chainId"] {
      return useStore(store, (s) => s.chainId);
    }

    function useAccount(): ConnectorState["account"] {
      return useStore(store, (s) => s.account);
    }

    function useIsActivating(): ConnectorState["activating"] {
      return useStore(store, (s) => s.activating);
    }

    function useIsActive(): boolean {
      const chainId = useChainId();
      const accounts = useAccount();
      const activating = useIsActivating();

      return Boolean(chainId && accounts && !activating);
    }

    return { useChainId, useAccount, useIsActivating, useIsActive };
  }
}
