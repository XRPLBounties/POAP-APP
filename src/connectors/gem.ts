import * as Gem from "@gemwallet/api";

import API from "apis";
import { Connector } from "connectors/connector";
import { AuthData, Provider, type ProviderRequestResult } from "connectors/provider";
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

  public async acceptOffer(id: string): Promise<ProviderRequestResult> {
    const response = await Gem.acceptNFTOffer({
      NFTokenSellOffer: id,
    });
    if (response.type === "reject") {
      throw Error("User refused to sign NFTokenAcceptOffer transaction");
    }

    return {
      resolved: Promise.resolve(Boolean(response.result?.hash)),
    };
  }

  public async setAccount(minterAddress: string): Promise<ProviderRequestResult> {
    const response = await Gem.setAccount({
      NFTokenMinter: minterAddress,
    });
    if (response.type === "reject") {
      throw Error("User refused to sign AccountSet transaction");
    }

    return {
      resolved: Promise.resolve(Boolean(response.result?.hash)),
    };
  }

  public async sendPayment(
    amount: string,
    destination: string,
    memo?: string
  ): Promise<ProviderRequestResult> {
    const response = await Gem.sendPayment({
      amount: amount,
      destination: destination,
      memos: memo
        ? [
            {
              memo: {
                memoData: Buffer.from(memo, "utf8")
                  .toString("hex")
                  .toUpperCase(),
              },
            },
          ]
        : [],
    });
    if (response.type === "reject") {
      throw Error("User refused to sign Payment transaction");
    }

    return {
      resolved: Promise.resolve(Boolean(response.result?.hash)),
    };
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
  private wallet: boolean;

  constructor({ options, onError }: GemWalletConstructorArgs) {
    super(onError);
    this.provider = undefined;
    this.options = options;
    this.wallet = false;
  }

  private mapNetworkId(network: Gem.Network): NetworkIdentifier {
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

  private async init(): Promise<void> {
    Gem.on("logout", async (event) => {
      await this.deactivate();
    });

    Gem.on("networkChanged", (event) => {
      this.state.update({
        networkId: this.mapNetworkId(event.network.name),
      });
    });

    Gem.on("walletChanged", async (event) => {
      console.log("walletChanged", event.wallet.publicAddress);
      await this.deactivate();
      await this.initProvider();
    });

    this.wallet = true;
  }

  private async initProvider(): Promise<void> {
    const cancelActivation = this.state.startActivation();

    try {
      const address = await Gem.getAddress();
      if (address.type === "reject" || !address.result) {
        throw Error("User refused to share wallet address");
      }

      const network = await Gem.getNetwork();
      if (network.type === "reject" || !network.result) {
        throw Error("User refused to share network");
      }

      const pubkey = await Gem.getPublicKey();
      if (pubkey.type === "reject" || !pubkey.result) {
        throw Error("User refused to share public key");
      }

      const tempJwt = await API.auth.nonce({
        pubkey: pubkey.result.publicKey,
      });

      const signed = await Gem.signMessage(
        `backend authentication: ${tempJwt}`
      );
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
    } catch (err) {
      cancelActivation();
      this.onError?.(err as Error);
      throw err;
    }
  }

  public async activate(): Promise<void> {
    const installed = await Gem.isInstalled();
    if (!installed.result.isInstalled) {
      throw new NoGemWalletError();
    }

    if (!this.wallet) {
      await this.init();
    }

    // only do something, if not already connected
    if (this.provider) {
      return;
    }

    await this.initProvider();
  }

  public async deactivate(): Promise<void> {
    this.provider = undefined;
    this.state.reset();
  }
}

export const gem = new GemWallet({});
