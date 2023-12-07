import { AccountSetAsfFlags } from "xrpl";
import { XummSdkJwt, SdkTypes } from "xumm-sdk";
import { XummPkce } from "xumm-oauth2-pkce";

import config from "config";
import { Connector } from "connectors/connector";
import {
  AuthData,
  Provider,
  type ProviderRequestResult,
} from "connectors/provider";
import { ConnectorType, NetworkIdentifier } from "types";

type CallbackData = {
  signed: boolean;
  txHash: string;
};

async function _wrap(
  promise?: Promise<CallbackData>
): Promise<string | undefined> {
  const result = await promise;
  return result?.signed ? result.txHash : undefined;
}

export class XummWalletProvider extends Provider {
  private sdk: XummSdkJwt;
  private jwt: string;
  private pendingPayloads: string[];

  constructor(sdk: XummSdkJwt, jwt: string) {
    super();
    this.sdk = sdk;
    this.jwt = jwt;
    this.pendingPayloads = []; // TODO make this session persistent (re-subscribe in case user refreshes page)
  }

  private async submitPayload(
    tx: SdkTypes.XummJsonTransaction,
    isMobile?: boolean
  ): Promise<SdkTypes.PayloadAndSubscription> {
    const callback = async (
      event: SdkTypes.SubscriptionCallbackParams
    ): Promise<CallbackData | undefined> => {
      console.debug("callback", event);
      if (event.data?.payload_uuidv4) {
        // set the deferred promise value and close the subscription
        return {
          signed: event.data.signed,
          txHash: event.data.txid,
        };
      }
    };

    const url = new URL(document.location.href);
    url.searchParams.set("connect", "1");

    const subscription = await this.sdk.payload.createAndSubscribe(
      {
        txjson: tx,
        options: isMobile
          ? {
              return_url: {
                app: url.toString(),
                web: url.toString(),
              },
            }
          : {},
      },
      callback
    );

    this.pendingPayloads.push(subscription.created.uuid);

    return subscription;
  }

  public async acceptOffer(
    id: string,
    isMobile?: boolean
  ): Promise<ProviderRequestResult> {
    const subscription = await this.submitPayload(
      {
        TransactionType: "NFTokenAcceptOffer",
        NFTokenSellOffer: id,
      },
      isMobile
    );

    return {
      resolved: _wrap(
        subscription.resolved as Promise<CallbackData> | undefined
      ),
      uuid: subscription.created.uuid,
    };
  }

  public async setAccount(
    minterAddress: string | null,
    isMobile?: boolean
  ): Promise<ProviderRequestResult> {
    const subscription = await this.submitPayload(
      minterAddress
        ? {
            TransactionType: "AccountSet",
            NFTokenMinter: minterAddress,
            SetFlag: AccountSetAsfFlags.asfAuthorizedNFTokenMinter,
          }
        : {
            TransactionType: "AccountSet",
            ClearFlag: AccountSetAsfFlags.asfAuthorizedNFTokenMinter,
          },
      isMobile
    );

    return {
      resolved: _wrap(
        subscription.resolved as Promise<CallbackData> | undefined
      ),
      uuid: subscription.created.uuid,
    };
  }

  public async sendPayment(
    value: string,
    destination: string,
    memo?: string,
    isMobile?: boolean
  ): Promise<ProviderRequestResult> {
    const subscription = await this.submitPayload(
      {
        TransactionType: "Payment",
        Amount: value,
        Destination: destination,
        Memos: memo
          ? [
              {
                Memo: {
                  MemoData: Buffer.from(memo, "utf8")
                    .toString("hex")
                    .toUpperCase(),
                },
              },
            ]
          : [],
      },
      isMobile
    );

    return {
      resolved: _wrap(
        subscription.resolved as Promise<CallbackData> | undefined
      ),
      uuid: subscription.created.uuid,
    };
  }

  public getAuthData(): AuthData {
    return {
      tempJwt: this.jwt,
    };
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
    this.provider = undefined;
    this.apiKey = apiKey;
    this.options = options;
  }

  private mapNetworkId(network: string): NetworkIdentifier {
    switch (network.toLowerCase()) {
      case "mainnet":
        return NetworkIdentifier.MAINNET;
      case "testnet":
        return NetworkIdentifier.TESTNET;
      case "devnet":
        return NetworkIdentifier.DEVNET;
      default:
        return NetworkIdentifier.UNKNOWN;
    }
  }

  public getType(): ConnectorType {
    return ConnectorType.XUMM;
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

      const { sdk, jwt, me } = state;
      const network = (me as any).networkType as string;
      this.provider = new XummWalletProvider(sdk, jwt);
      this.state.update({
        networkId: this.mapNetworkId(network),
        account: me.account,
      });
    });

    this.wallet.on("retrieved", async () => {
      const state = await this.wallet?.state();
      if (!state) {
        return;
      }

      const { sdk, jwt, me } = state;
      const network = (me as any).networkType as string;
      this.provider = new XummWalletProvider(sdk, jwt);
      this.state.update({
        networkId: this.mapNetworkId(network),
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
