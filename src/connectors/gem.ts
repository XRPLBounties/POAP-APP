import {
  getAddress,
  getNetwork,
  isConnected,
  signMessage,
} from "@gemwallet/api";

import { Connector } from "connectors/connector";
import { Provider } from "connectors/provider";
import { ChainIdentifier } from "./chain";

export class NoGemWalletError extends Error {
  public constructor() {
    super("GemWallet not installed");
    this.name = NoGemWalletError.name;
    Object.setPrototypeOf(this, NoGemWalletError.prototype);
  }
}

export class GemWalletProvider extends Provider {
  public async signMessage(message: string): Promise<string> {
    try {
      const connected = await isConnected();
      if (!connected) {
        throw new NoGemWalletError();
      }

      const signed = await signMessage(message);
      if (signed === null) {
        throw Error("User refused to sign message");
      }
      if (!signed) {
        throw Error("Failed to sign message");
      }
      return signed;
    } catch (error) {
      // TODO
      throw error;
    }
  }

  public async acceptOffer(id: string): Promise<boolean> {
    // TODO not yet supported
    return false;
  }
}

type GemWalletOptions = any;

export type GemWalletConstructorArgs = {
  options?: GemWalletOptions;
  onError?: (error: Error) => void;
};

export class GemWallet extends Connector {
  public provider: GemWalletProvider | undefined;

  private readonly options: GemWalletOptions;

  constructor({ options, onError }: GemWalletConstructorArgs) {
    super(onError);
    this.options = options;
  }

  private mapChainId(network: string): ChainIdentifier {
    switch (network.toLowerCase()) {
      case "mainnet":
        return ChainIdentifier.MAINNET;
      case "testnet":
        return ChainIdentifier.TESTNET;
      case "devnet":
        return ChainIdentifier.DEVNET;
      case "amm-devnet":
        return ChainIdentifier.AMM_DEVNET;
      default:
        return ChainIdentifier.UNKNOWN;
    }
  }

  public async activate(): Promise<void> {
    const cancelActivation = this.state.startActivation();

    this.provider = new GemWalletProvider();

    try {
      const connected = await isConnected();
      if (!connected) {
        throw new NoGemWalletError();
      }

      const address = await getAddress();
      if (address === null) {
        throw Error("User refused to share GemWallet address");
      }

      const network: string = await getNetwork();

      this.state.update({
        chainId: this.mapChainId(network),
        account: address,
      });
    } catch (error) {
      cancelActivation();
      this.onError?.(error as Error);
      throw error;
    }
  }

  public async deactivate(): Promise<void> {
    this.provider = undefined;
    this.state.reset();
  }
}

export const gem = new GemWallet({});
