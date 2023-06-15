import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
  useContext,
} from "react";
import { LedgerContext } from "../contexts/LedgerProvider";

const AccountVerification = () => {
  const {
    xummInstance,
    account,
    chainId,
    connected,
    connect,
    disconnect,
    getData,
  } = useContext(LedgerContext);
  const [formValues, setFormValues] = useState({
    minter: "",
    eventId: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  async function verifyAccOwnership(event) {
    try {
      event.preventDefault();

      const { minter, eventId } = formValues;

      const sigMemo = await fetch(
        `/api/startVerification/?walletAddress=${account}`
      );

      if (sigMemo.status == 200) {
        let responseToJson = await sigMemo.json();
        console.log(responseToJson.result);

        const hex = await getData(responseToJson.result);
        console.log(hex);

        const loginRes = await fetch(
          `/api/verifyOwnership/?walletAddress=${account}&signature=${hex}&minter=${minter}&eventId=${eventId}`
        );

        responseToJson = await loginRes.json();

        if (loginRes.status == 200) {
          console.log(responseToJson);
          console.log(responseToJson.result);
          console.log("Wallet ownership has been proven");
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="flex justify-center items-center h-full w-full">
      <form
        onSubmit={verifyAccOwnership}
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
            Verify
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountVerification;
