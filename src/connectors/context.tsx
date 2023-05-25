import type { ReactNode } from "react";
import React from "react";

import { Connector } from "connectors/connector";
import { State } from "connectors/state";
import type { Provider } from "connectors/provider";
import { CONNECTORS } from "connectors";

export type Web3ContextType = {
  connector?: Connector;
  provider?: Provider;
  chainId: ReturnType<State["getChainId"]>;
  account: ReturnType<State["getAccount"]>;
  isActivating: ReturnType<State["isActivating"]>;
  isActive: ReturnType<State["isActive"]>;
};

export const Web3Context = React.createContext<Web3ContextType | undefined>(
  undefined
);

export type Web3ProviderProps = {
  children: ReactNode;
};

export function Web3Provider({ children }: Web3ProviderProps) {
  // Note: Calling hooks in a map is okay in this case, because 'CONNECTORS'
  // never changes and the same hooks are called each time.
  const values = CONNECTORS.map((c) => {
    const { useIsActive } = c.state.getHooks();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useIsActive();
  });
  const index = values.findIndex((isActive) => isActive);
  const connector = CONNECTORS[index === -1 ? 0 : index];

  const provider = connector.provider;
  const chainId = connector.state.getChainId();
  const account = connector.state.getAccount();
  const isActivating = connector.state.isActivating();
  const isActive = connector.state.isActive();

  return (
    <Web3Context.Provider
      value={{
        connector,
        provider,
        chainId,
        account,
        isActivating,
        isActive,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3(): Web3ContextType {
  const context = React.useContext(
    Web3Context as React.Context<Web3ContextType | undefined>
  );
  if (!context) {
    throw Error("useWeb3 can only be used within the Web3Context component");
  }
  return context;
}
