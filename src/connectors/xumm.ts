import { XummPkce } from "xumm-oauth2-pkce";

import { Connector } from "connectors/connector";
import { Provider } from "connectors/provider";
import config from "config";
import { ChainIdentifier } from "./chain";

// TODO
type XummWalletProvider = Provider;
type XummWalletOptions = ConstructorParameters<typeof XummPkce>[1];

export type XummWalletConstructorArgs = {
  apiKey: string;
  options?: XummWalletOptions;
  onError?: (error: Error) => void;
};

export class XummWallet extends Connector {
  public provider: XummWalletProvider | undefined;

  private readonly apiKey: string;
  private readonly options: XummWalletOptions;
  private wallet: XummPkce | undefined;

  constructor({ apiKey, options, onError }: XummWalletConstructorArgs) {
    super(onError);
    this.apiKey = apiKey;
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
      default:
        return ChainIdentifier.UNKNOWN;
    }
  }

  private async init(): Promise<void> {
    this.wallet = new XummPkce(this.apiKey, this.options);

    // TODO create provider
    this.provider = undefined;

    this.wallet.on("error", (error) => {
      this.onError?.(error);
    });

    this.wallet.on("success", async () => {
      const state = await this.wallet?.state();
      if (!state) {
        throw Error("Missing Xumm state");
      }

      const { me } = state;
      const network = (me as any).networkType as string;
      this.state.update({
        chainId: this.mapChainId(network),
        account: me.account,
      });
    });

    this.wallet.on("retrieved", async () => {
      const state = await this.wallet?.state();
      if (!state) {
        return;
      }

      const { me } = state;
      const network = (me as any).networkType as string;
      this.state.update({
        chainId: this.mapChainId(network),
        account: me.account,
      });
    });

    this.wallet.on("loggedout", async () => {
      this.state.reset();
    });
  }

  public async activate(): Promise<void> {
    // only do something, if not already connected
    const state = await this.wallet?.state();
    if (state) {
      return;
    }

    const cancelActivation = this.state.startActivation();

    try {
      await this.init();
      if (!this.wallet) {
        throw new Error("No Xumm wallet");
      }

      await this.wallet.authorize();
    } catch (error) {
      cancelActivation();
      throw error;
    }
  }

  public async deactivate(): Promise<void> {
    await this.wallet?.logout();
    this.wallet = undefined;
    this.provider = undefined;
    this.state.reset();
  }
}

export const xumm = new XummWallet({
  apiKey: config.connector.xumm.apiKey,
  options: config.connector.xumm.options,
});
