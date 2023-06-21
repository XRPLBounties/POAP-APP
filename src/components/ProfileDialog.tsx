import React from "react";
import axios from "axios";
import { useAtom } from "jotai";
import type { ReactNode } from "react";
import { useSnackbar } from "notistack";
import { useForm, SubmitHandler } from "react-hook-form";
import { literal, object, string, TypeOf } from "zod";
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

const schema = object({
  firstName: string().max(64, "First Name must be less than 64 characters"),
  lastName: string().max(64, "Last name must be less than 64 characters"),
  email: string().email("Email is invalid").optional().or(literal("")),
});

type ProfileFormValues = TypeOf<typeof schema>;

const defaultValues: ProfileFormValues = {
  firstName: "",
  lastName: "",
  email: "",
};

type ProfileDialogProps = {
  children?: ReactNode;
};

function ProfileDialog(props: ProfileDialogProps) {
  const { account } = useWeb3();
  const [open, setOpen] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [activeDialog, setActiveDialog] = useAtom(activeDialogAtom);
  const { enqueueSnackbar } = useSnackbar();

  // Note: These values are only loaded ONCE when the component is first mounted!
  const loadedValues = async () => {
    if (activeDialog.type === DialogIdentifier.DIALOG_PROFILE && account) {
      try {
        const result = await API.getUser({
          walletAddress: account!,
          includeEvents: false,
        });
        if (!result) {
          throw Error("User not found");
        }

        return {
          firstName: result.firstName
            ? result.firstName
            : defaultValues.firstName,
          lastName: result.lastName ? result.lastName : defaultValues.lastName,
          email: result.email ? result.email : defaultValues.email,
        };
      } catch (error) {
        console.debug(error);
        if (axios.isAxiosError(error)) {
          enqueueSnackbar(`Failed to load profile data: ${error.message}`, {
            variant: "error",
          });
        } else {
          enqueueSnackbar("Failed to load profile data", {
            variant: "error",
          });
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
      // convert empty strings to null
      const result = await API.updateUser({
        walletAddress: account!,
        firstName: values.firstName ? values.firstName : null,
        lastName: values.lastName ? values.lastName : null,
        email: values.email ? values.email : null,
      });

      enqueueSnackbar("Profile update successful", {
        variant: "success",
      });
    } catch (error) {
      console.debug(error);
      if (axios.isAxiosError(error)) {
        enqueueSnackbar(`Profile update failed: ${error.message}`, {
          variant: "error",
        });
      } else {
        enqueueSnackbar("Profile update failed", {
          variant: "error",
        });
      }
    } finally {
      setLoading(false);
    }

    reset();
    setActiveDialog({});
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
          disabled={loading || !Boolean(account) || isLoading || !isDirty || !isValid}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProfileDialog;
