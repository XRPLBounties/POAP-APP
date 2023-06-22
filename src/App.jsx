import { useState, useEffect, useContext, useCallback } from "react";
import "./App.css";
import {
  Client,
  getBalanceChanges,
  rippleTimeToISOTime,
  rippleTimeToUnixTime,
} from "xrpl";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import LedgerProvider from "./contexts/LedgerProvider.tsx";
import { LedgerContext } from "./contexts/LedgerProvider.tsx";
import Home from "./pages/Home";

function App() {
  const { xummInstance, account, chainId, connected } =
    useContext(LedgerContext);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Navbar />}>
        <Route path="/" element={<Home />} />
        <Route path="manage" element={<Home />} />
        <Route path="attendee" element={<Home />} />
      </Route>
    )
  );

  useEffect(() => {
    (async () => {})();
  }, []);

  return (
    <>
      <LedgerProvider>
        <div className="min-w-screen h-screen bg-base-100">
          <RouterProvider router={router} />
        </div>
      </LedgerProvider>
    </>
  );
}

export default App;
