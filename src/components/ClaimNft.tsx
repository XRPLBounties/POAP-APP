import React, { useState, useEffect, useContext, useCallback } from "react";
import { LedgerContext } from "../contexts/LedgerProvider";

const ClaimNft = () => {
  const [alertText, setAlertText] = useState("");
  const {
    xummInstance,
    account,
    chainId,
    connected,
    connect,
    disconnect,
    acceptNftClaim,
  } = useContext(LedgerContext);
  const [formValues, setFormValues] = useState({
    minter: import.meta.env.VITE_BACKEND_MINTER_ADDRESS,
    eventId: 0,
    walletAddress: account,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { minter, eventId, walletAddress } = formValues;

    const response = await fetch(
      `/api/claim/?walletAddress=${account}&type=2&minter=${minter}&eventId=${eventId}`
    );

    if (response.ok) {
      console.log(response);
      let responseToJson = await response.json();
      console.log(responseToJson.status);
      console.log(responseToJson.offer);

      if (responseToJson.status == "transferred") {
        setAlertText(`NFT claim process started`);
        const claimAcceptanceRes = await acceptNftClaim(
          responseToJson.offer.nft_offer_index
        );
        console.log(claimAcceptanceRes);
        if (!claimAcceptanceRes) {
          setAlertText("Error: NFT transfer tx wasn't accepted by the user");
        } else {
          setAlertText("NFT claim was completed");
        }
      }
      if (responseToJson.status == "empty")
        setAlertText("Error: limit of minted NFTs for this event was reached");
      if (responseToJson.status == "claimed")
        setAlertText(
          "Error: NFT for this event was already claimed for this account"
        );

      // setAlertText(
      //   `Event with id ${responseToJson.result.eventId} has NFTs minted by ${responseToJson.result.account}`
      // );
    } else {
      console.error(response);
      setAlertText("Error: couldn't claim NFT from this event");
    }
  };

  useEffect(() => {
    (async () => {})();
  }, []);

  return (
    <div className="flex justify-center items-center h-full w-full ">
      <form
        onSubmit={handleSubmit}
        className="py-6 px-20 rounded-lg bg-base-200 w-full md:w-3/4"
      >
        <div className="mb-4">
          <label
            className="block text-gray-400 font-bold mb-2"
            htmlFor="minter"
          >
            Minter
          </label>
          <input
            defaultValue={formValues.minter}
            className="bg-base-100 shadow appearance-none rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
            id="minter"
            type="text"
            placeholder="Minter's wallet address"
            name="minter"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-400 font-bold mb-2"
            htmlFor="eventId"
          >
            Event ID
          </label>
          <input
            defaultValue={formValues.eventId}
            className="bg-base-100 shadow appearance-none rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
            id="eventId"
            type="number"
            placeholder="Event ID"
            name="eventId"
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex justify-center">
          <button
            className="center content-center self-center text-center bg-green-400 hover:bg-green-500 text-gray-100 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>

      <div
        className={
          alertText.length > 0
            ? "flex flex-col items-center mx-auto fixed w-full lg:w-2/3 top-32 lg:top-24 xl:top-20"
            : "hidden"
        }
      >
        <div
          className={
            "" +
            (alertText.length > 0
              ? "alert absolute right-1/5 bottom-0 z-20 w-3/4 md:w-1/2"
              : "hidden") +
            (alertText.includes("Error")
              ? "alert alert-error w-3/4 md:w-1/2"
              : "alert alert-success w-3/4 md:w-1/2")
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={
              "stroke-current shrink-0 h-6 w-6 hover:cursor-pointer" +
              (alertText.length > 0 ? "" : "hidden")
            }
            fill="none"
            viewBox="0 0 24 24"
            onClick={() => setAlertText("")}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{alertText}</span>
        </div>
      </div>
    </div>
  );
};

export default ClaimNft;
