import React from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { useSnackbar } from "notistack";
import { isValidClassicAddress } from "xrpl";

import {
  useForm,
  SubmitHandler,
  Controller,
  DefaultValues,
  ControllerFieldState,
} from "react-hook-form";
import { array, object, string, TypeOf } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

import API from "apis";
import { useWeb3 } from "connectors/context";
import { activeDialogAtom } from "states/atoms";
import { DialogIdentifier } from "types";
import { useAuth } from "components/AuthContext";

const schema = object({
  addresses: array(
    object({
      address: string()
        .nonempty("Address is required")
        .max(256, "Address must be less than 64 characters")
        .trim()
        .refine(
          (value) => isValidClassicAddress(value),
          "Must be a valid classic XRP address"
        ),
      displayValue: string().optional(),
    })
  )
    .min(1, "Must provide at least 1 wallet address")
    .max(20)
    .refine(
      (items) => {
        const addresses = items.map((x) => x.address);
        return new Set(addresses).size === items.length;
      },
      {
        message: "Must be a list of unique addresses",
      }
    ),
});

type AddFormValues = TypeOf<typeof schema>;

type ArrayElementType<T> = T extends (infer E)[] ? E : T;

const filter = createFilterOptions<
  ArrayElementType<AddFormValues["addresses"]>
>({
  ignoreCase: false,
});

const defaultValues: DefaultValues<AddFormValues> = {
  addresses: [],
};

type AddDialogData = Record<string, any>;

function AddDialog() {
  const { account } = useWeb3();
  const { isAuthenticated, jwt, permissions } = useAuth();
  const [open, setOpen] = React.useState<boolean>(false);
  const [data, setData] = React.useState<AddDialogData | undefined>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [options, setOptions] = React.useState<AddFormValues["addresses"]>([]);
  const [activeDialog, setActiveDialog] = useAtom(activeDialogAtom);
  const { enqueueSnackbar } = useSnackbar();

  const {
    control,
    formState: { isValid },
    reset,
    handleSubmit,
  } = useForm<AddFormValues>({
    mode: "all",
    defaultValues: defaultValues,
    resolver: zodResolver(schema),
  });

  const isAuthorized = React.useMemo(() => {
    return isAuthenticated && permissions.includes("organizer");
  }, [isAuthenticated, permissions]);

  React.useEffect(() => {
    setOpen(activeDialog.type === DialogIdentifier.DIALOG_ADD);
    setData(activeDialog.data);
  }, [activeDialog]);

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (jwt) {
          const addresses = await API.users.getAll(jwt);

          if (mounted) {
            setOptions(
              addresses.map((address) => {
                return { address: address };
              })
            );
          }
        }
      } catch (err) {
        console.debug(err);
        if (mounted) {
          setOptions([]);
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
      setOptions([]);
    }

    return () => {
      mounted = false;
    };
  }, [isAuthorized, jwt]);

  const handleClose = (event: {}, reason?: string) => {
    if (reason === "backdropClick") {
      return;
    }
    setData(undefined);
    setActiveDialog({});
  };

  const handleCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
    reset();
    setData(undefined);
    setActiveDialog({});
  };

  const onSubmit: SubmitHandler<AddFormValues> = async (values) => {
    setLoading(true);
    try {
      if (account && data?.eventId && jwt) {
        const addresses: string[] = values.addresses.map(
          (item) => item.address
        );
        await API.event.invite(jwt, {
          eventId: data.eventId,
          attendeeWalletAddresses: addresses,
        });
        enqueueSnackbar(
          `Invite successful: Added ${addresses.length} participant(s)`,
          {
            variant: "success",
          }
        );
        reset();
      }
    } catch (err) {
      console.debug(err);
      if (axios.isAxiosError(err)) {
        enqueueSnackbar(`Invite failed: ${err.response?.data.error}`, {
          variant: "error",
        });
      } else {
        enqueueSnackbar(`Invite failed: ${(err as Error).message}`, {
          variant: "error",
        });
      }
    } finally {
      setLoading(false);
      setData(undefined);
      setActiveDialog({});
    }
  };

  const getHelperText = (
    fieldState: ControllerFieldState
  ): string | undefined => {
    if (Array.isArray(fieldState.error) && fieldState.error.length > 0) {
      return fieldState.error[0].address.message as string;
    } else {
      return fieldState.error?.message;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle
        sx={{
          paddingBottom: 0,
        }}
        variant="h5"
      >
        Add new Participants to Event #{data?.eventId}
      </DialogTitle>
      <IconButton
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
        size="small"
        onClick={handleClose}
        disabled={loading}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      <DialogContent>
        <DialogContentText sx={{ paddingBottom: "0.75rem" }}>
          Add any platform user to this event. Please note, that users must
          exist on the platform and must have an <strong>activated</strong>,
          valid XRP address on the selected network.
        </DialogContentText>
        <Stack
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          direction="column"
          spacing={2}
        >
          <Controller
            control={control}
            name="addresses"
            render={({
              field: { ref, value, onChange, ...field },
              fieldState,
            }) => (
              <Autocomplete
                {...field}
                value={value}
                onChange={(event, values) => {
                  onChange(
                    values.map((v) => {
                      if (typeof v === "string") {
                        return { address: v };
                      } else {
                        return v;
                      }
                    })
                  );
                }}
                filterOptions={(options, state) => {
                  const filtered = filter(options, state);

                  // Suggest the creation of a new value
                  const { inputValue } = state;
                  const value = inputValue.trim();
                  const isExisting = options.some(
                    (option) => value === option.address
                  );
                  if (value !== "" && !isExisting) {
                    filtered.push({
                      address: value,
                      displayValue: `Add "${value}"`,
                    });
                  }

                  return filtered;
                }}
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                options={options}
                getOptionLabel={(option) => {
                  if (typeof option === "string") {
                    return option;
                  } else {
                    return option.address;
                  }
                }}
                renderOption={(props, option) => (
                  <li {...props}>{option.displayValue ?? option.address}</li>
                )}
                freeSolo
                multiple
                renderInput={(params) => (
                  <TextField
                    {...params}
                    inputRef={ref}
                    label="Wallet Addresses"
                    required
                    error={!!fieldState.error}
                    helperText={getHelperText(fieldState)}
                  />
                )}
              />
            )}
          ></Controller>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="primary" onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleSubmit(onSubmit)}
          startIcon={loading && <CircularProgress size={20} />}
          disabled={
            loading || !Boolean(account) || !isValid || !isAuthenticated
          }
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddDialog;
