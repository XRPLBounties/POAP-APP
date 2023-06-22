import React, { useState, useEffect, useContext, useCallback } from "react";
import { LedgerContext } from "../contexts/LedgerProvider";

const Hero = () => {
  const [alertText, setAlertText] = useState("");
  const { xummInstance, account, chainId, connected, connect, disconnect } =
    useContext(LedgerContext);
  const [formValues, setFormValues] = useState({
    name: "",
    location: "",
    image: "",
    amount: 0,
    description: "",
    walletAddress: account,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleFileChange = (event) => {
    const { name, value } = event.target.files[0];
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { name, location, image, amount, description, walletAddress } =
      formValues;

    const response = await fetch(
      `/api/mint/?walletAddress=${walletAddress}&tokenCount=${amount}&url=${image}&title=${name}&desc=${description}&loc=${location}}`
    );

    if (response.ok) {
      console.log(response);
      let responseToJson = await response.json();
      console.log(responseToJson.result);
      setAlertText(
        `Event with id ${responseToJson.result.eventId} has NFTs minted by ${responseToJson.result.account}`
      );
    } else {
      console.error(response);
      setAlertText("Error: couldn't create new event");
    }
  };

  useEffect(() => {
    (async () => {})();
  }, []);

  return (
    <div className="flex justify-center items-center h-full w-full">
      <form
        onSubmit={handleSubmit}
        className="py-6 px-20 rounded-lg bg-base-200 w-full md:w-3/4"
      >
        <div className="mb-4">
          <label className="block text-gray-400 font-bold mb-2" htmlFor="name">
            Title
          </label>
          <input
            className="bg-base-100 shadow appearance-none rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            placeholder="Event Title"
            name="name"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-400 font-bold mb-2"
            htmlFor="location"
          >
            Event Location
          </label>
          <input
            className="bg-base-100 shadow appearance-none rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
            id="location"
            type="text"
            placeholder="Event Location"
            name="location"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 font-bold mb-2" htmlFor="image">
            NFT Image(url)
          </label>
          <input
            className="bg-base-100 shadow appearance-none rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
            id="image"
            type="text"
            name="image"
            accept=".png,.jpg, .JPEG"
            placeholder="Enter link to image for your NFTs"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-400 font-bold mb-2"
            htmlFor="amount"
          >
            Amount of NFTs
          </label>
          <input
            className="bg-base-100 shadow appearance-none rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
            id="amount"
            type="number"
            name="amount"
            placeholder="Number of NFTs to be minted"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-400 font-bold mb-2"
            htmlFor="description"
          >
            Event Description
          </label>
          <textarea
            className="bg-base-100 shadow appearance-none rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline h-48"
            id="description"
            type="text"
            placeholder="Enter description for your event"
            name="description"
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
            ? "flex flex-col items-center mx-auto fixed w-full lg:w-2/3 top-14 lg:top-10 xl:top-8"
            : "hidden"
        }
      >
        <div
          className={
            "" +
            (alertText.length > 0 ? "alert z-20 w-3/4 md:w-1/2" : "hidden") +
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

export default Hero;
