import React, { useState, useEffect, useContext, useCallback } from "react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
  Routes,
} from "react-router-dom";
import { LedgerContext } from "../../contexts/LedgerProvider";
import { truncateStr } from "../../utils";
import Home from "../../pages/Home";

const Navbar = () => {
  const {
    xummInstance,
    account,
    chainId,
    connected,
    connect,
    disconnect,
    getData,
    gemConnect,
  } = useContext(LedgerContext);

  useEffect(() => {
    (async () => {
      // console.log(xummInstance);
      // console.log(account);
    })();
  }, []);

  const signInWithXumm = async () => {
    console.log("conecting with XUMM");
    const res = await connect();
    // console.log(res);
    // console.log(await xummInstance);
    // console.log(account);
  };

  const signInWithGem = async () => {
    await gemConnect();
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center w-full h-full">
        <div className="items-start m-2 lg:hidden w-full absolute lef-0 top-0">
          <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-6 h-6 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </label>
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="manage" element={<Home />} />
          <Route path="attendee" element={<Home />} />
        </Routes>
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
        <ul className="menu p-4 w-80 h-full bg-base-200 text-base-content justify-between font-bold">
          <li className="gap-2">
            <Link
              className={`flex text-gray-400 hover:text-green-300
            cursor-pointer transition-colors duration-300 bg-base-100`}
              to="/"
            >
              Events
            </Link>
            <Link
              className={`flex text-gray-400 hover:text-green-300
            cursor-pointer transition-colors duration-300 bg-base-100`}
              to="attendee"
            >
              Attendee Dashboard
            </Link>
            <Link
              className={`flex text-gray-400 hover:text-green-300
            cursor-pointer transition-colors duration-300 bg-base-100`}
              to="manage"
            >
              Event Management
            </Link>
          </li>
          {!account ? (
            <li className="w-full flex gap-2">
              <div
                onClick={() => signInWithGem()}
                className={`flex text-gray-400 hover:text-green-300
            cursor-pointer transition-colors duration-300 bg-base-100`}
              >
                <ArrowRightOnRectangleIcon className="fill-current h-5 w-5 mr-2 mt-0.5 text-green-300" />

                <div>Gem Wallet login</div>
              </div>

              <div
                onClick={() => signInWithXumm()}
                className={`flex text-gray-400 hover:text-green-300
            cursor-pointer transition-colors duration-300 bg-base-100`}
              >
                <ArrowRightOnRectangleIcon className="fill-current h-5 w-5 mr-2 mt-0.5 text-green-300" />

                <div>XUMM login</div>
              </div>

              {/* <div className="flex items-center space-x-5 bg-base-100 rounded-lg">
                  <a
                    className="flex
                    cursor-pointer transition-colors duration-300
                    font-semibold text-green-300"
                  >
                    <ArrowRightOnRectangleIcon className="fill-current h-5 w-5 mr-2 mt-0.5 text-green-300" />

                    <div onClick={() => signInWithGem()}>Gem Wallet login</div>
                  </a>
                </div> */}
            </li>
          ) : (
            <li
              className="cursor-pointer bg-base-100 rounded-lg font-semibold text-green-300 py-2 px-8 text-center w-full mx-auto"
              onClick={() => disconnect()}
            >
              Connected: {truncateStr(account)}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
