import React from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { useSnackbar } from "notistack";
import { useForm, SubmitHandler } from "react-hook-form";
import { object, string, literal, TypeOf } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";

import API from "apis";
import { useWeb3 } from "connectors/context";
import { activeDialogAtom } from "states/atoms";
import { DialogIdentifier } from "types";
import { useAuth } from "components/AuthContext";

const schema = object({
  firstName: string()
    .max(64, "First Name must be less than 64 characters")
    .trim(),
  lastName: string()
    .max(64, "Last name must be less than 64 characters")
    .trim(),
  email: string().email("Email is invalid").trim().optional().or(literal("")),
});

type ProfileFormValues = TypeOf<typeof schema>;

const defaultValues: ProfileFormValues = {
  firstName: "",
  lastName: "",
  email: "",
};

function ProfileDialog() {
  const { account } = useWeb3();
  const { isAuthenticated, jwt } = useAuth();
  const [open, setOpen] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [activeDialog, setActiveDialog] = useAtom(activeDialogAtom);
  const { enqueueSnackbar } = useSnackbar();

  // Note: These values are only loaded ONCE when the component is first mounted!
  const loadedValues = async () => {
    if (
      activeDialog.type === DialogIdentifier.DIALOG_PROFILE &&
      account &&
      jwt
    ) {
      try {
        const result = await API.user.getInfo(jwt, {
          includeEvents: false,
        });

        return {
          firstName: result?.firstName ?? defaultValues.firstName,
          lastName: result?.lastName ?? defaultValues.lastName,
          email: result?.email ?? defaultValues.email,
        };
      } catch (err) {
        console.debug(err);
        if (axios.isAxiosError(err)) {
          enqueueSnackbar(
            `Failed to load profile data: ${err.response?.data.error}`,
            {
              variant: "error",
            }
          );
        } else {
          enqueueSnackbar(
            `Failed to load profile data: ${(err as Error).message}`,
            {
              variant: "error",
            }
          );
        }
      }
    }
    return defaultValues;
  };

  const {
    register,
    formState: { errors, isLoading, isDirty, isValid },
    reset,
    handleSubmit,
  } = useForm<ProfileFormValues>({
    mode: "onBlur",
    defaultValues: loadedValues,
    resolver: zodResolver(schema),
  });

  React.useEffect(() => {
    setOpen(activeDialog.type === DialogIdentifier.DIALOG_PROFILE);
  }, [activeDialog]);

  const handleClose = (event: {}, reason?: string) => {
    if (reason === "backdropClick") {
      return;
    }
    reset();
    setActiveDialog({});
  };

  const handleCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
    reset();
    setActiveDialog({});
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (values) => {
    setLoading(true);
    try {
      if (jwt) {
        // convert empty strings to null
        await API.user.update(jwt, {
          firstName: values.firstName ? values.firstName : null,
          lastName: values.lastName ? values.lastName : null,
          email: values.email ? values.email : null,
        });
        enqueueSnackbar("Profile update successful", {
          variant: "success",
        });
      }
    } catch (err) {
      console.debug(err);
      if (axios.isAxiosError(err)) {
        enqueueSnackbar(`Profile update failed: ${err.response?.data.error}`, {
          variant: "error",
        });
      } else {
        enqueueSnackbar(`Profile update failed: ${(err as Error).message}`, {
          variant: "error",
        });
      }
    } finally {
      setLoading(false);
      reset();
      setActiveDialog({});
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
        Your Profile
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
        <Stack
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          direction="column"
          spacing={2}
        >
          <TextField
            label="First Name"
            type="string"
            disabled={loading || isLoading}
            error={!!errors["firstName"]}
            helperText={errors["firstName"]?.message}
            {...register("firstName")}
          />
          <TextField
            label="Last Name"
            type="string"
            disabled={loading || isLoading}
            error={!!errors["lastName"]}
            helperText={errors["lastName"]?.message}
            {...register("lastName")}
          />
          <TextField
            label="Email Address"
            type="email"
            disabled={loading || isLoading}
            error={!!errors["email"]}
            helperText={errors["email"]?.message}
            {...register("email")}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleSubmit(onSubmit)}
          type="submit"
          startIcon={loading && <CircularProgress size={20} />}
          disabled={
            loading ||
            !Boolean(account) ||
            isLoading ||
            !isDirty ||
            !isValid ||
            !isAuthenticated
          }
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProfileDialog;
