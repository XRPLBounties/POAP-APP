import {
  Network,
  getAddress,
  getNetwork,
  isInstalled,
  signMessage,
  acceptNFTOffer,
} from "@gemwallet/api";

import { Connector } from "connectors/connector";
import { Provider } from "connectors/provider";
import { ConnectorType, NetworkIdentifier } from "types";

export class NoGemWalletError extends Error {
  public constructor() {
    super("GemWallet not installed");
    this.name = NoGemWalletError.name;
    Object.setPrototypeOf(this, NoGemWalletError.prototype);
  }
}

export class GemWalletProvider extends Provider {
  public async signMessage(message: string): Promise<string> {
    const signed = await signMessage(message);
    if (signed.type === "reject") {
      throw Error("User refused to sign message");
    }

    if (!signed.result) {
      throw Error("Failed to sign message");
    }

    return signed.result.signedMessage;
  }

  public async acceptOffer(id: string): Promise<boolean> {
    const response = await acceptNFTOffer({
      NFTokenSellOffer: id,
    });
    if (response.type === "reject") {
      throw Error("User refused to sign transaction");
    }

    return Boolean(response.result?.hash);
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

  private mapNetworkId(network: Network): NetworkIdentifier {
    switch (network.toString().toLowerCase()) {
      case "mainnet":
        return NetworkIdentifier.MAINNET;
      case "testnet":
        return NetworkIdentifier.TESTNET;
      case "devnet":
        return NetworkIdentifier.DEVNET;
      case "amm-devnet":
        return NetworkIdentifier.AMM_DEVNET;
      default:
        return NetworkIdentifier.UNKNOWN;
    }
  }

  public getType(): ConnectorType {
    return ConnectorType.GEM;
  }

  public async activate(): Promise<void> {
    const cancelActivation = this.state.startActivation();
    this.provider = undefined;

    try {
      const installed = await isInstalled();
      if (!installed.result.isInstalled) {
        throw new NoGemWalletError();
      }

      this.provider = new GemWalletProvider();

      const address = await getAddress();
      if (address.type === "reject" || !address.result) {
        throw Error("User refused to share GemWallet address");
      }

      const network = await getNetwork();
      if (network.type === "reject" || !network.result) {
        throw Error("User refused to share network");
      }

      this.state.update({
        networkId: this.mapNetworkId(network.result.network),
        account: address.result.address,
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
