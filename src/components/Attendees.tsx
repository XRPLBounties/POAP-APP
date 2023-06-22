import React, { useState, useEffect, useContext, useCallback } from "react";
import { LedgerContext } from "../contexts/LedgerProvider";

const Attendees = () => {
  const [alertText, setAlertText] = useState("");
  const [attendees, setAttendees] = useState([]);
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
      `/api/attendees/?minter=${minter}&eventId=${eventId}`
    );

    if (response.ok) {
      console.log(response);
      let responseToJson = await response.json();
      // console.log(responseToJson.status);
      console.log(responseToJson.result);
      console.log(responseToJson.result.length);

      if (responseToJson.result.length != 0 && responseToJson.result.length) {
        setAlertText("List of attendees for this event has been fetched");
        setAttendees(responseToJson.result);
      } else {
        setAlertText("Error: Event attendee list is empty");
        setAttendees([]);
      }

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
    <div className="flex flex-col justify-center items-center h-full w-full ">
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

      {attendees.length != 0 ? (
        <div className="overflow-x-auto w-full md:w-3/4 h-full my-8">
          <table className="table rounded-lg bg-base-200">
            <thead>
              <tr>
                <th>ID</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((item, index) => (
                <tr key={index}>
                  <th>{index}</th>
                  <th>{item.user}</th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        ""
      )}

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

export default Attendees;
