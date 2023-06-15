import React, { useState, useEffect, useContext, useCallback } from "react";
import { LedgerContext } from "../contexts/LedgerProvider";
import Hero from "../components/Hero";
import ClaimNft from "../components/ClaimNft";
import Attendees from "../components/Attendees";
import AccountVerification from "../components/AccountVerification";

function Home() {
  const [payloadUuid, setPayloadUuid] = useState("");
  const [lastPayloadUpdate, setLastPayloadUpdate] = useState("");
  const [openPayloadUrl, setOpenPayloadUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [displayedVaults, setDisplayedVaults] = useState([]);
  const { xummInstance, account, chainId, connected, connect, disconnect } =
    useContext(LedgerContext);

  async function signInWithXumm() {
    const res = await connect();
  }

  useEffect(() => {
    (async () => {})();
  }, []);

  return (
    <>
      <div className="min-w-screen w-full h-full flex items-center justify-center flex-col mx-auto">
        {!account ? (
          <button
            className="text-green-300 border border-green-300 rounded-xl px-5 py-2 mx-auto mt-24"
            onClick={signInWithXumm}
          >
            XUMM login
          </button>
        ) : (
          <div className="flex flex-col p-5 items-center w-full h-full justify-items-start justifyy-start">
            <div className="text-6xl font-bold my-24 text-gray-300">
              Claim NFT from existing event
            </div>
            <ClaimNft />
            <div className="text-6xl font-bold my-24 text-gray-300">
              Attendees lookup
            </div>
            <Attendees />
            <div className="text-6xl font-bold my-24 text-gray-300">
              Create new event
            </div>

            <Hero />
            <div className="text-6xl font-bold my-24 text-gray-300">
              Verify account ownership
            </div>
            <AccountVerification />
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
