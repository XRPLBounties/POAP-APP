import React from "react";
import axios from "axios";

import { useSnackbar } from "notistack";

import { Box, Button, Link } from "@mui/material";

import CircularProgress from "@mui/material/CircularProgress";

import API from "apis";
import { useWeb3 } from "connectors/context";
import { useAuth } from "components/AuthContext";
import Loader from "components/Loader";
import { StepProps } from "./types";
import { Event } from "types";

function PaymentStep({
  active,
  loading,
  eventId,
  setError,
  setComplete,
  setLoading,
  setActions,
}: StepProps) {
  const { isActive, provider, networkId } = useWeb3();
  const { isAuthenticated, jwt, permissions } = useAuth();
  const [data, setData] = React.useState<Event>();
  const [count, setCount] = React.useState<number>(0);
  const { enqueueSnackbar } = useSnackbar();

  const isAuthorized = React.useMemo(() => {
    return isAuthenticated && permissions.includes("organizer");
  }, [isAuthenticated, permissions]);

  // update parent state
  React.useEffect(() => {
    if (active) {
      setComplete(Boolean(data?.accounting?.depositTxHash));
    }
  }, [active, data?.accounting]);

  // TODO only load event info, if active, if not active reset

  // fetch authorized minter info
  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (eventId && jwt) {
          const event = await API.event.getInfo(eventId, jwt);

          // TODO
          console.log(event);

          if (mounted) {
            setData(event);
          }
        }
      } catch (err) {
        console.debug(err);
        if (mounted) {
          setData(undefined);
        }
        if (axios.isAxiosError(err)) {
          enqueueSnackbar(
            `Failed to load stats data: ${err.response?.data.error}`,
            {
              variant: "error",
            }
          );
        } else {
          enqueueSnackbar("Failed to load stats data", {
            variant: "error",
          });
        }
      }
    };

    // TODO only if active, but don't reset?
    if (isAuthorized && active) {
      load();
    } else {
      setData(undefined);
    }

    return () => {
      mounted = false;
    };
  }, [active, eventId, isAuthorized, jwt, count]);

  const handleConfirm = React.useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      setLoading(true);
      try {
        if (jwt && networkId && provider && eventId && data?.accounting) {
          const value = (
            BigInt(data.accounting.depositReserveValue) +
            BigInt(data.accounting.depositFeeValue)
          ).toString();
          const result = await provider.sendPayment(
            value,
            data.accounting.depositAddress,
            `deposit event ${eventId}`
          );
          const txHash = await result.resolved;
          console.log(txHash);

          if (!txHash) {
            // TODO
            throw Error("Payment failed");
          }

          const success = await API.payment.check(jwt, {
            networkId: networkId,
            txHash: txHash,
          });

          console.log(success);

          // TODO handle fail

          // TODO force re-download event
          setCount((c) => c + 1);
          // TODO reset local state?
        }

        // DEBUG
      } catch (err) {
        console.debug(err);
        if (axios.isAxiosError(err)) {
          enqueueSnackbar(`Sign-up failed: ${err.response?.data.error}`, {
            variant: "error",
          });
        } else {
          enqueueSnackbar(`Sign-up failed: ${(err as Error).message}`, {
            variant: "error",
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [eventId, jwt, networkId, data, provider, enqueueSnackbar, setLoading]
  );

  // set actions
  React.useEffect(() => {
    if (active) {
      setActions([
        <Button
          color="primary"
          onClick={handleConfirm}
          startIcon={loading && <CircularProgress size={20} />}
          disabled={
            loading || !isActive || !isAuthorized || !Boolean(data?.accounting)
          }
        >
          Send
        </Button>,
      ]);
    } else {
      setActions([]);
    }
  }, [
    active,
    loading,
    isActive,
    isAuthorized,
    data?.accounting,
    handleConfirm,
  ]);

  // TODO display "checking minter status" while we load the status with spinner
  return active ? (
    <Box>
      <p>isAuthorized: {isAuthorized ? "true" : "false"}</p>

      {data?.accounting ? (
        <React.Fragment>
          <Box>
            <p>Reserve Deposit Breakdown</p>
            <p>For tokenCount: {data.tokenCount}</p>
            <code>
              Base Owner Reserve = 2 XRP NFTokenPage Reserve = 2 *
              ([tokenCount]/16) = 8.33 = 10 XRP (Reserves round up) NFTokenOffer
              Reserve = 2 * [tokenCount] = 200 XRP Total Deposit = TODO
            </code>
            <Link
              href="https://xrpl.org/nftokenpage.html#reserve-for-nftokenpage-objects"
              target="_blank"
              rel="noopener noreferrer"
            >
              Details here
            </Link>
            <Link
              href="https://xrpl.org/reserves.html#owner-reserves"
              target="_blank"
              rel="noopener noreferrer"
            >
              Details here
            </Link>
          </Box>

          <Box>
            <p>txHash: {data.accounting.depositTxHash}</p>
            <p>Deposit Address: {data.accounting.depositAddress}</p>
            <p>Deposit Reserve: {data.accounting.depositReserveValue}</p>
            <p>Deposit Fee: {data.accounting.depositFeeValue}</p>
            <p>
              Deposit Total:{" "}
              {(
                BigInt(data.accounting.depositReserveValue) +
                BigInt(data.accounting?.depositFeeValue)
              ).toString()}
            </p>
            <p>Transaction Cost: ~15 drops</p>
          </Box>
        </React.Fragment>
      ) : (
        <Loader text="Loading Event Payment Status..." />
      )}
    </Box>
  ) : null;
}

export default PaymentStep;
