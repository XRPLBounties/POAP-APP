import React from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useAtom } from "jotai";

import { Box, Button } from "@mui/material";

import API from "apis";
import { useWeb3 } from "connectors/context";
import ContentWrapper from "components/ContentWrapper";
import { useAuth } from "components/AuthContext";
import type { User } from "types";

function AdminUsersPage() {
  const { isActive, networkId } = useWeb3();
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

  return (
    <ContentWrapper
      title="Admin Panel"
      isLoading={!Boolean(data)}
      isAuthorized={isAuthorized}
    >
      Users
    </ContentWrapper>
  );
}

export default AdminUsersPage;
