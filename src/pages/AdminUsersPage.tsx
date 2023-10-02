import React from "react";
import axios from "axios";
import { dropsToXrp } from "xrpl";
import { useSnackbar } from "notistack";

import { Typography } from "@mui/material";

import API from "apis";
import ContentWrapper from "components/ContentWrapper";
import { useAuth } from "components/AuthContext";
import { EventStatus, type User } from "types";
import UserTable, { UserTableRow } from "components/UserTable";
import BackButton from "components/BackButton";

function AdminUsersPage() {
  const { isAuthenticated, jwt, permissions } = useAuth();
  const [data, setData] = React.useState<User[]>();
  const { enqueueSnackbar } = useSnackbar();

  const isAuthorized = React.useMemo(() => {
    return isAuthenticated && permissions.includes("admin");
  }, [isAuthenticated, permissions]);

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (jwt) {
          const users = await API.users.getOrganizers(jwt);

          if (mounted) {
            setData(users);
          }
        }
      } catch (err) {
        console.debug(err);
        if (mounted) {
          setData(undefined);
        }
        if (axios.isAxiosError(err)) {
          enqueueSnackbar(
            `Failed to load users data: ${err.response?.data.error}`,
            {
              variant: "error",
            }
          );
        } else {
          enqueueSnackbar(
            `Failed to load users data: ${(err as Error).message}`,
            {
              variant: "error",
            }
          );
        }
      }
    };

    if (isAuthorized) {
      load();
    } else {
      setData(undefined);
    }

    return () => {
      mounted = false;
    };
  }, [isAuthorized, jwt]);

  const rows = React.useMemo<UserTableRow[]>(() => {
    if (data) {
      return data.map((user, index) => {
        const activeEvents = user.events?.filter((x) =>
          [EventStatus.PAID, EventStatus.ACTIVE].includes(x.status)
        );
        return {
          id: index,
          walletAddress: user.walletAddress,
          isOrganizer: user.isOrganizer,
          eventCount: user.events?.length,
          eventActiveCount: activeEvents?.length,
          totalDeposit: dropsToXrp(
            (
              activeEvents?.reduce<bigint>(
                (accumulator, event) =>
                  accumulator +
                  BigInt(event.accounting?.depositReserveValue || "0") +
                  BigInt(event.accounting?.depositFeeValue || "0"),
                BigInt(0)
              ) || BigInt(0)
            ).toString()
          ),
        };
      });
    } else {
      return [];
    }
  }, [data]);

  return (
    <ContentWrapper
      isLoading={!Boolean(data)}
      isAuthorized={isAuthorized}
      secondary={<BackButton />}
      offsetSecondaryTop="0rem"
    >
      <Typography sx={{ marginBottom: "1rem" }} variant="h6">
        Organizers Overview
      </Typography>
      <UserTable rows={rows} />
    </ContentWrapper>
  );
}

export default AdminUsersPage;
