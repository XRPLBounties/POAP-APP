import type { ReactNode } from "react";
import React from "react";
import { decodeToken, isExpired } from "react-jwt";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import API from "apis";
import { useWeb3 } from "connectors/context";
import { ConnectorType, JwtPayload, WalletType } from "types";
import { XummWalletProvider } from "connectors/xumm";
import { GemWalletProvider } from "connectors/gem";

type State = {
  tokens: Record<string, string>;
  isAuto: boolean;
};

type Actions = {
  addToken: (address: string, token: string) => void;
  removeToken: (address: string) => void;
  toggleAuto: () => void;
  reset: () => void;
};

const initialState: State = {
  tokens: {},
  isAuto: true,
};

const useAuthStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initialState,
      addToken: (address: string, token: string) => {
        set({ tokens: { ...get().tokens, [address]: token } });
      },
      removeToken: (address: string) => {
        const tokens = get().tokens;
        delete tokens[address];
        set({ tokens: tokens });
      },
      toggleAuto: () => {
        set({ isAuto: !get().isAuto });
      },
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export type AuthContextType = {
  isAvailable: boolean;
  isAuthenticated: boolean;
  isAuto: boolean;
  isClaimFlow: boolean;
  jwt?: string;
  permissions: string[];
  login: () => Promise<void>;
  logout: () => void;
  toggleAuto: Actions["toggleAuto"];
  setClaimFlow: (value: boolean) => void;
};

export const AuthContext = React.createContext<AuthContextType | undefined>(
  undefined
);

export type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const { connector, provider, account, networkId } = useWeb3();
  const { isAuto, tokens, addToken, removeToken, toggleAuto } = useAuthStore();
  const [isClaimFlow, setIsClaimFlow] = React.useState<boolean>(false);
  const [isAvailable, setIsAvailable] = React.useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [jwt, setJwt] = React.useState<string>();
  const [permissions, setPermissions] = React.useState<string[]>([]);

  const checkStore = React.useCallback(() => {
    if (account) {
      const token = tokens[account];
      if (token && !isExpired(token)) {
        return token;
      }
    }
  }, [account, tokens]);

  const acquireToken = React.useCallback(async () => {
    if (connector && provider && account) {
      switch (connector.getType()) {
        case ConnectorType.XUMM: {
          const data = await (provider as XummWalletProvider).getAuthData();
          const token = await API.auth.login({
            walletAddress: account,
            walletType: WalletType.XUMM_WALLET,
            data: data.tempJwt,
            claimFlow: isClaimFlow,
          });
          return token;
        }
        case ConnectorType.GEM: {
          const data = await (provider as GemWalletProvider).getAuthData();
          const token = await API.auth.login({
            walletAddress: account,
            walletType: WalletType.GEM_WALLET,
            data: data.tempJwt,
            signature: data.signature,
            claimFlow: isClaimFlow,
          });
          return token;
        }
      }
    }
  }, [account, connector, provider, isClaimFlow]);

  const reset = React.useCallback(() => {
    setIsAuthenticated(false);
    setJwt(undefined);
    setPermissions([]);
  }, []);

  const login = React.useCallback(async () => {
    if (account) {
      // try to load from cache first
      let token = checkStore();
      if (token) {
        console.debug("Using cached jwt");
        const payload = decodeToken(token);
        setJwt(token);
        setPermissions((payload as JwtPayload)?.permissions ?? []);
        setIsAuthenticated(true);
        return;
      }

      // regular authentication
      token = await acquireToken();
      if (token) {
        const payload = decodeToken(token);
        setJwt(token);
        setPermissions((payload as JwtPayload)?.permissions ?? []);
        addToken(account, token);
        setIsAuthenticated(true);
        return;
      }
    }
  }, [account, checkStore, acquireToken, addToken]);

  const logout = React.useCallback(() => {
    if (account) {
      removeToken(account);
    }
    reset();
  }, [account, removeToken, reset]);

  // check backend service availability
  React.useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        await API.auth.heartbeat();
        if (mounted) {
          setIsAvailable(true);
        }
      } catch (err) {
        console.log(err);
        if (mounted) {
          setIsAvailable(false);
        }
      }
    };

    const interval = setInterval(check, 30 * 1000);
    check();

    // clear interval to prevent memory leaks when unmounting
    return () => {
      clearInterval(interval);
      mounted = false;
    };
  }, []);

  // authenticate with backend service
  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        // FIX: setting states without checking for mounted in login
        await login();
      } catch (err) {
        console.debug(err);
        if (mounted) {
          reset();
        }
      }
    };

    if (isAuto && isAvailable) {
      if (account) {
        load();
      } else {
        reset();
      }
    }

    return () => {
      mounted = false;
    };
  }, [account, networkId, isAuto, isAvailable, login, reset]);

  return (
    <AuthContext.Provider
      value={{
        isAvailable,
        isAuthenticated,
        isAuto,
        isClaimFlow,
        jwt,
        permissions,
        login,
        logout,
        toggleAuto,
        setClaimFlow: setIsClaimFlow,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = React.useContext(
    AuthContext as React.Context<AuthContextType | undefined>
  );
  if (!context) {
    throw Error("useAuth can only be used within the AuthContext component");
  }
  return context;
}
