import {
  acceptNFTOffer,
  getAddress,
  getNetwork,
  getPublicKey,
  isInstalled,
  Network,
  signMessage,
} from "@gemwallet/api";
import API from "apis";

import { Connector } from "connectors/connector";
import { AuthData, Provider } from "connectors/provider";
import { ConnectorType, NetworkIdentifier } from "types";

export class NoGemWalletError extends Error {
  public constructor() {
    super("GemWallet not installed");
    this.name = NoGemWalletError.name;
    Object.setPrototypeOf(this, NoGemWalletError.prototype);
  }
}

export type GemAuthData = AuthData & {
  signature: string;
};

export class GemWalletProvider extends Provider {
  private authData: GemAuthData;

  constructor(authData: GemAuthData) {
    super();
    this.authData = authData;
  }

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

  public getAuthData(): GemAuthData {
    return this.authData;
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

      const address = await getAddress();
      if (address.type === "reject" || !address.result) {
        throw Error("User refused to share GemWallet address");
      }

      const network = await getNetwork();
      if (network.type === "reject" || !network.result) {
        throw Error("User refused to share network");
      }

      const pubkey = await getPublicKey();
      if (pubkey.type === "reject" || !pubkey.result) {
        throw Error("User refused to share public key");
      }

      const tempJwt = await API.auth.nonce({
        pubkey: pubkey.result.publicKey,
      });

      const signed = await signMessage(`backend authentication: ${tempJwt}`);
      if (signed.type === "reject" || !signed.result) {
        throw Error("User refused to sign auth message");
      }

      this.provider = new GemWalletProvider({
        tempJwt: tempJwt,
        signature: signed.result.signedMessage,
      });

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
