import { XummSdkJwt, SdkTypes } from "xumm-sdk";
import { XummPkce } from "xumm-oauth2-pkce";

import { Connector } from "connectors/connector";
import { Provider } from "connectors/provider";
import config from "config";
import { ChainIdentifier } from "./chain";

export class XummWalletProvider extends Provider {
  private sdk: XummSdkJwt;
  private pendingPayloads: string[];

  constructor(sdk: XummSdkJwt) {
    super();
    this.sdk = sdk;
    this.pendingPayloads = []; // TODO make this session persistent (re-subscribe in case user refreshes page)
  }

  private async submitPayload(tx: SdkTypes.XummJsonTransaction): Promise<any> {
    const callback = async (event: SdkTypes.SubscriptionCallbackParams) => {
      console.debug("callback", event);
      if (event.data?.payload_uuidv4) {
        // set the deferred promise value and close the subscription
        return event.data?.signed;
      }
    };

    const payload = await this.sdk.payload.createAndSubscribe(tx, callback);
    this.pendingPayloads.push(payload.created.uuid);
    return payload.resolved;
  }

  public async signMessage(message: string): Promise<string> {
    // TODO not yet supported
    return "";
  }

  public async acceptOffer(id: string): Promise<boolean> {
    const result = await this.submitPayload({
      TransactionType: "NFTokenAcceptOffer",
      NFTokenSellOffer: id,
    });

    return Boolean(result);
  }
}

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
    this.provider = undefined;

    this.wallet.on("error", (error) => {
      this.onError?.(error);
    });

    this.wallet.on("success", async () => {
      const state = await this.wallet?.state();
      if (!state) {
        throw Error("Missing Xumm state");
      }

      const { sdk, me } = state;
      const network = (me as any).networkType as string;
      this.provider = new XummWalletProvider(sdk);
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

      const { sdk, me } = state;
      const network = (me as any).networkType as string;
      this.provider = new XummWalletProvider(sdk);
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
