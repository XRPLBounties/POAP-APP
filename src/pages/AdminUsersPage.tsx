import React from "react";
import axios from "axios";
import { dropsToXrp } from "xrpl";
import { useSnackbar } from "notistack";

import API from "apis";
import ContentWrapper from "components/ContentWrapper";
import { useAuth } from "components/AuthContext";
import type { User } from "types";
import UserTable, { UserTableRow } from "components/UserTable";

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
          console.log(users); // TODO

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
          enqueueSnackbar("Failed to load users data", {
            variant: "error",
          });
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
      return data.map((user, index) => ({
        id: index,
        walletAddress: user.walletAddress,
        isOrganizer: user.isOrganizer,
        eventCount: user.events?.length,
        totalDeposit: dropsToXrp(
          user.events?.reduce<number>(
            (accumulator, event) =>
              accumulator + (event.accounting?.depositValue ?? 0),
            0
          ) ?? 0
        ),
      }));
    } else {
      return [];
    }
  }, [data]);

  return (
    <ContentWrapper
      title="Organizers Overview"
      isLoading={!Boolean(data)}
      isAuthorized={isAuthorized}
    >
      <UserTable rows={rows} />
    </ContentWrapper>
  );
}

export default AdminUsersPage;
