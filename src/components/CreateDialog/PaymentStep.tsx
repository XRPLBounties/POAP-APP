import React from "react";
import axios from "axios";

import { useSnackbar } from "notistack";

import { Box, Button, Grid, Link, Typography } from "@mui/material";

import CircularProgress from "@mui/material/CircularProgress";

import API from "apis";
import { useWeb3 } from "connectors/context";
import { useAuth } from "components/AuthContext";
import Loader from "components/Loader";
import { StepProps } from "./types";
import { Event } from "types";
import InfoBox from "components/InfoBox";
import ContentBox from "./ContentBox";
import Debug from "components/Debug";
import { dropsToXrp } from "xrpl";

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

  // fetch authorized minter info
  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (eventId && jwt) {
          const event = await API.event.getInfo(eventId, jwt);

          if (!event?.accounting) {
            throw Error("Unable to fetch event");
          }

          if (mounted) {
            setError(null);
            setData(event);
          }
        }
      } catch (err) {
        const msg = "Failed to load payment info";
        console.debug(err);
        if (mounted) {
          setError(msg);
          setData(undefined);
        }
        if (axios.isAxiosError(err)) {
          enqueueSnackbar(`${msg}: ${err.response?.data.error}`, {
            variant: "error",
          });
        } else {
          enqueueSnackbar(`${msg}: ${(err as Error).message}`, {
            variant: "error",
          });
        }
      }
    };

    if (active && isAuthorized) {
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

          if (!txHash) {
            throw Error("Transaction rejected");
          }

          const success = await API.payment.check(jwt, {
            networkId: networkId,
            txHash: txHash,
          });

          if (!success) {
            throw Error("Payment unconfirmed");
          }

          // force update event info
          setCount((c) => c + 1);
        }
      } catch (err) {
        const msg = "Failed to transfer payment";
        console.debug(err);
        setError(msg);
        if (axios.isAxiosError(err)) {
          enqueueSnackbar(`${msg}: ${err.response?.data.error}`, {
            variant: "error",
          });
        } else {
          enqueueSnackbar(`${msg}: ${(err as Error).message}`, {
            variant: "error",
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [eventId, jwt, networkId, data, provider]
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
          Pay
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

  const reserveInfo = React.useMemo(() => {
    if (data?.tokenCount) {
      const tokenCount = data.tokenCount;
      const baseReserve = 2;
      const pageReserve = data.tokenCount / 16;
      const pageReserveRounded =
        baseReserve * Math.floor((data.tokenCount + 15) / 16);
      const offerReserve = baseReserve * data.tokenCount;
      return {
        "Token Count": `${tokenCount}`,
        "Base Reserve": `${baseReserve} XRP`,
        "NFT Page Reserve": `${baseReserve} * ⌈(${tokenCount}/16)⌉ = ${baseReserve} * ⌈${pageReserve}⌉ = ${pageReserveRounded} XRP`,
        "NFT Offer Reserve": `${baseReserve} * ${tokenCount} = ${offerReserve} XRP`,
        "Total Reserve": `${pageReserveRounded} + ${offerReserve} = ${
          pageReserveRounded + offerReserve
        } XRP`,
      };
    }
  }, [data?.tokenCount]);

  const depositInfo = React.useMemo(() => {
    if (data?.accounting) {
      const total = (
        BigInt(data.accounting.depositReserveValue) +
        BigInt(data.accounting?.depositFeeValue)
      ).toString();
      return {
        "Deposit Address": data.accounting.depositAddress,
        "Reserve Deposit": `${dropsToXrp(
          data.accounting.depositReserveValue
        )} XRP`,
        "Tx Fee Deposit": `${dropsToXrp(data.accounting.depositFeeValue)} XRP`,
        "Total Deposit": `${dropsToXrp(total)} XRP`,
        "Transaction Fee": `~${dropsToXrp(15)} XRP`,
      };
    }
  }, [data?.accounting]);

  return active ? (
    <Box>
      <InfoBox sx={{ marginBottom: "1rem" }}>
        <Typography>
          Ledger objects are owned by a specific account. Each object
          contributes to the owner's reserve requirement. More details can be
          found in the XRPL{" "}
          <Link
            href="https://xrpl.org/reserves.html#owner-reserves"
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
          >
            documentation
          </Link>
          .
        </Typography>
      </InfoBox>

      {data && reserveInfo && depositInfo ? (
        <React.Fragment>
          <Box>
            <Typography
              sx={{ fontWeight: "500", marginBottom: "0.375rem" }}
              variant="body2"
            >
              Reserve Breakdown:
            </Typography>
            <ContentBox sx={{ marginBottom: "1rem" }}>
              <Grid
                container
                direction="row"
                justifyContent="space-between"
                spacing={0.5}
              >
                {Object.entries(reserveInfo).map(([key, value], index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={12}>
                      <Typography
                        sx={{ fontFamily: "monospace" }}
                        variant="body2"
                      >
                        {key}: <strong>{value}</strong>
                      </Typography>
                    </Grid>
                  </React.Fragment>
                ))}
              </Grid>
            </ContentBox>

            <Typography
              sx={{ fontWeight: "500", marginBottom: "0.375rem" }}
              variant="body2"
            >
              Deposit Info:
            </Typography>
            <ContentBox>
              <Grid
                container
                direction="row"
                justifyContent="space-between"
                spacing={0.5}
              >
                {Object.entries(depositInfo).map(([key, value], index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={4}>
                      <Typography
                        sx={{ fontFamily: "monospace" }}
                        variant="body2"
                      >
                        {key}
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography
                        sx={{ fontFamily: "monospace", textAlign: "right" }}
                        variant="body2"
                        fontWeight="bold"
                      >
                        {value}
                      </Typography>
                    </Grid>
                  </React.Fragment>
                ))}
              </Grid>
            </ContentBox>
          </Box>
        </React.Fragment>
      ) : (
        <Loader text="Loading Payment Status..." />
      )}

      <Debug
        value={{
          depositTxHash: data?.accounting?.depositTxHash,
        }}
      />
    </Box>
  ) : null;
}

export default PaymentStep;
