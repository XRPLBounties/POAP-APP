import React, { createContext, useCallback, useEffect, useState } from "react";
import { Xumm } from "xumm";
import { sleep } from "../utils";
import { convertStringToHex } from "xrpl";
import { isConnected, getAddress, getNetwork } from "@gemwallet/api";

export const LedgerContext = createContext({
  xummInstance: null,
  account: null,
  chainId: null,
  connected: false,
  usedWallet: null,
  connect: () => {},
  disconnect: () => {},
  getData: () => {},
  acceptNftClaim: () => {},
  gemConnect: () => {},
});

const LedgerProvider = ({ children }) => {
  const [xummInstance, setXummInstance] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [usedWallet, setUsedWallet] = useState("");

  const connect = async () => {
    console.log("Logged in: ", xummInstance);
    setInitialized(true);
    await xummInstance.authorize();
    setConnected(true);
    await xummInstance.user.account.then((a) => {
      setAccount(a ?? "");
      console.log(xummInstance);
      setXummInstance(xummInstance);
    });
    // getData();
    setUsedWallet("XUMM");
    return xummInstance;
  };

  const gemConnect = async () => {
    if (await isConnected()) {
      setAccount(await getAddress());
      setChainId(await getNetwork());
      setConnected(true);
      setUsedWallet("GEM");
    } else {
      console.log("Gem wallet not detected. Please install it or use XUMM");
    }
  };

  const disconnect = async () => {
    xummInstance.logout();
    setAccount(null);
    setChainId(null);
    setConnected(false);
    setUsedWallet("");
  };

  const getData = async (MemoId) => {
    if (usedWallet == "XUMM") {
      let payloadRes;
      let payload = await xummInstance.payload?.createAndSubscribe(
        {
          Account: account,
          Destination: account,
          TransactionType: "SignIn",
          // TransactionType: "AccountSet",
          // TransactionType: "Payment",
          // Amount: {
          //   currency: "XRP",
          //   value: "0",
          //   issuer: account,
          // },
          // Fee: "12",
          // Sequence: 5,
          // Domain: "6578616D706C652E636F6D",
          // SetFlag: 5,
          // MessageKey:
          //   "03AB40A0490F9B7ED8DF29D246BF2D6269820A0EE7742ACDD457BEA7C7D0931EDB",
          Memos: [
            {
              Memo: {
                MemoData: convertStringToHex(MemoId),
              },
            },
          ],
        },
        async (event) => {
          // Return if signed or not signed (rejected)
          console.log(JSON.stringify(event.data, null, 2));
          // Only return (websocket will live till non void)
          if (Object.keys(event.data).indexOf("signed") > -1) {
            const { payload_uuidv4 } = await xummInstance.environment.jwt;
            const payloadResult = await xummInstance.payload?.get(
              payload_uuidv4
            );
            console.log(payloadResult);
            payloadRes = payloadResult.response.hex;
            return true;
          }
        }
      );

      console.log(`payload: `, payload);
      console.log(await xummInstance.payload?.get(payload.created));
      window.open(payload.created.next.no_push_msg_received);

      // xummInstance.on("success", async () => {
      //   // console.log(await xummInstance.payload?.get(payload.created));
      //   const { payload_uuidv4 } = await xummInstance.environment.jwt;
      //   const payloadResult = await xummInstance.payload?.get(payload_uuidv4);
      //   console.log(payloadResult);
      // });

      for (;;) {
        console.log("Waiting for user to sign tx");
        if (payloadRes) {
          console.log(payloadRes);
          return payloadRes;
        } else {
          await sleep(1000);
        }
      }
    }

    if (usedWallet == "GEM") {
    }
  };

  const acceptNftClaim = async (sellOfferId) => {
    if (usedWallet == "XUMM") {
      let payloadRes;
      let payload = await xummInstance.payload?.createAndSubscribe(
        {
          Account: account,
          NFTokenSellOffer: sellOfferId,
          TransactionType: "NFTokenAcceptOffer",
        },
        async (event) => {
          // Return if signed or not signed (rejected)
          console.log(JSON.stringify(event.data, null, 2));
          // Only return (websocket will live till non void)
          if (Object.keys(event.data).indexOf("signed") > -1) {
            const { payload_uuidv4 } = await xummInstance.environment.jwt;
            const payloadResult = await xummInstance.payload?.get(
              payload_uuidv4
            );
            console.log(payloadResult);
            payloadRes = payloadResult.response.hex;
            return true;
          }
        }
      );

      console.log(`payload: `, payload);
      console.log(await xummInstance.payload?.get(payload.created));
      window.open(payload.created.next.no_push_msg_received);

      // xummInstance.on("success", async () => {
      //   // console.log(await xummInstance.payload?.get(payload.created));
      //   const { payload_uuidv4 } = await xummInstance.environment.jwt;
      //   const payloadResult = await xummInstance.payload?.get(payload_uuidv4);
      //   console.log(payloadResult);
      // });

      for (;;) {
        console.log("Waiting for user to sign tx");
        if (payloadRes) {
          console.log(payloadRes);
          return payloadRes;
        } else {
          console.log(payloadRes);
          await sleep(1000);
        }
      }
    }

    if (usedWallet == "GEM") {
    }
  };

  useEffect(() => {
    (async () => {
      console.log(import.meta.env.VITE_XUMM_API_KEY);
      const xumm = new Xumm(import.meta.env.VITE_XUMM_API_KEY);
      await xumm.on("ready", async () => {
        // console.log(xummInstance);
        await setXummInstance(xumm);
        console.log("Ready (e.g. hide loading state of page)");
      });
    })();
  }, []);

  useEffect(() => {
    console.log("initialized ", initialized);
    if (!initialized && xummInstance) {
      (async () => {
        console.log(xummInstance);
        const connectedAcc = xummInstance.user.account.then((a) => {
          // console.log("a ", a);
          if (a.length != 0 && !initialized) {
            setInitialized(true);
            console.log("connecting");
            connect();
          }
          return a;
        });
      })();
    }
  }, [xummInstance]);

  return (
    <LedgerContext.Provider
      value={{
        xummInstance,
        account,
        chainId,
        connected,
        usedWallet,
        connect,
        disconnect,
        getData,
        acceptNftClaim,
        gemConnect,
      }}
    >
      {children}
    </LedgerContext.Provider>
  );
};

export default LedgerProvider;
