import React from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import {
  useForm,
  SubmitHandler,
  Controller,
  DefaultValues,
} from "react-hook-form";
import {
  boolean,
  date,
  intersection,
  literal,
  number,
  object,
  string,
  TypeOf,
} from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import API from "apis";
import { useWeb3 } from "connectors/context";
import { useAuth } from "components/AuthContext";
import InfoBox from "components/InfoBox";
import { StepProps } from "./types";
import config from "config";

const schemaCommon = object({
  title: string()
    .nonempty("Title is required")
    .max(256, "Title must be less than 256 characters")
    .trim(),
  description: string()
    .nonempty("Description is required")
    .max(10000, "Description must be less than 10000 characters"),
  location: string()
    .nonempty("Location is required")
    .max(256, "Location must be less than 256 characters"),
  url: string().url("URL is invalid").trim().optional().or(literal("")),
  tokenCount: number()
    .int()
    .positive()
    .max(200, "Token count must be less than or equal to 200"),
  isPublic: boolean(),
});

// Note: We allow nullable for the DatePicker component to work.
//       The final value will always be a valid Date.
const schemaDates = object({
  dateStart: date()
    .min(new Date("1900-01-01"), "Date is too far back")
    .nullable()
    .transform((value, ctx) => {
      if (value == null)
        ctx.addIssue({
          code: "custom",
          message: "Start Date is required",
        });
      return value;
    }),
  dateEnd: date()
    .min(new Date(Date.now()), "Date must be in the future")
    .nullable()
    .transform((value, ctx) => {
      if (value == null)
        ctx.addIssue({
          code: "custom",
          message: "End Date is required",
        });
      return value;
    }),
}).refine(
  (data) => {
    if (data.dateEnd && data.dateStart) {
      return data.dateEnd >= data.dateStart;
    }
    return false;
  },
  {
    path: ["dateEnd"],
    message: "End Date must be later than Start Date",
  }
);

const schema = intersection(schemaCommon, schemaDates);

type CreateFormValues = TypeOf<typeof schema>;

const defaultValues: DefaultValues<CreateFormValues> = {
  title: "",
  description: "",
  location: "",
  url: "",
  dateStart: null,
  dateEnd: null,
  tokenCount: undefined,
  isPublic: true,
};

function RegistrationStep({
  active,
  loading,
  eventId,
  setLoading,
  setEventId,
  setActions,
  setError,
  setComplete,
}: StepProps) {
  const { networkId } = useWeb3();
  const { isAuthenticated, jwt, permissions } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const {
    control,
    register,
    formState: { errors, isValid },
    reset,
    handleSubmit,
  } = useForm<CreateFormValues>({
    mode: "all",
    defaultValues: defaultValues,
    resolver: zodResolver(schema),
  });

  const isAuthorized = React.useMemo(() => {
    return isAuthenticated && permissions.includes("organizer");
  }, [isAuthenticated, permissions]);

  // update parent state
  React.useEffect(() => {
    if (active) {
      setComplete(Boolean(eventId));
    } else {
      reset();
    }
  }, [active, eventId]);

  const onSubmit: SubmitHandler<CreateFormValues> = React.useCallback(
    async (values) => {
      setLoading(true);
      try {
        if (networkId && isAuthorized && jwt) {
          const randomIndex = Math.floor(
            Math.random() * config.defaultEventImageUrls.length
          );
          const randomUrl = config.defaultEventImageUrls[randomIndex];

          const result = await API.event.create(jwt, {
            networkId: networkId,
            tokenCount: values.tokenCount,
            title: values.title,
            description: values.description,
            location: values.location,
            imageUrl: values.url ? values.url : randomUrl,
            dateStart: values.dateStart!,
            dateEnd: values.dateEnd!,
            isManaged: !values.isPublic,
          });

          enqueueSnackbar(`Registration successful: Event #${result.eventId}`, {
            variant: "success",
          });

          setEventId(result.eventId);
          reset();
        }
      } catch (err) {
        const msg = "Failed to register event";
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
    [isAuthorized, jwt, networkId, reset]
  );

  // set actions
  React.useEffect(() => {
    if (active) {
      setActions([
        <Button
          color="primary"
          onClick={handleSubmit(onSubmit)}
          startIcon={loading && <CircularProgress size={20} />}
          disabled={loading || !isAuthorized || !isValid}
        >
          Register
        </Button>,
      ]);
    } else {
      setActions([]);
    }
  }, [active, loading, isAuthorized, isValid, handleSubmit, onSubmit]);

  return active ? (
    <Box>
      <InfoBox title="Important" sx={{ marginBottom: "1rem" }}>
        <Typography>
          Each event slot has a reserve requirement of <strong>~2.1 XRP</strong>
          , which has to be deposited for the duration of the event!
        </Typography>
      </InfoBox>
      <Stack
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
        direction="column"
        spacing={2}
      >
        <TextField
          label="Title"
          type="string"
          disabled={loading}
          required
          error={!!errors["title"]}
          helperText={errors["title"]?.message}
          {...register("title")}
        />
        <TextField
          label="Description"
          type="string"
          disabled={loading}
          required
          multiline
          rows={4}
          error={!!errors["description"]}
          helperText={errors["description"]?.message}
          {...register("description")}
        />
        <TextField
          label="Location"
          type="string"
          disabled={loading}
          required
          multiline
          rows={2}
          error={!!errors["location"]}
          helperText={errors["location"]?.message}
          {...register("location")}
        />
        <TextField
          label="Image URL"
          type="url"
          disabled={loading}
          error={!!errors["url"]}
          helperText={errors["url"]?.message}
          {...register("url")}
        />
        <Stack direction="row" spacing={2}>
          <Controller
            control={control}
            name="dateStart"
            rules={{ required: true }}
            render={({
              field: { ref, onBlur, name, ...field },
              fieldState,
            }) => (
              <DatePicker
                {...field}
                inputRef={ref}
                label="Start Date"
                disabled={loading}
                slotProps={{
                  textField: {
                    name: name,
                    required: true,
                    onBlur: onBlur,
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message,
                  },
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="dateEnd"
            render={({
              field: { ref, onBlur, name, ...field },
              fieldState,
            }) => (
              <DatePicker
                {...field}
                inputRef={ref}
                label="End Date"
                disabled={loading}
                slotProps={{
                  textField: {
                    name: name,
                    required: true,
                    onBlur: onBlur,
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message,
                  },
                }}
              />
            )}
          />
        </Stack>
        <TextField
          label="Token Count"
          type="number"
          disabled={loading}
          required
          error={!!errors["tokenCount"]}
          helperText={errors["tokenCount"]?.message}
          {...register("tokenCount", { valueAsNumber: true })}
        />
        {/* <Controller
            control={control}
            name="isPublic"
            render={({ field: { ref, value, ...field }, fieldState }) => (
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      inputRef={ref}
                      checked={value}
                      color={!!fieldState.error ? "error" : "primary"}
                    />
                  }
                  label={
                    <Typography
                      color={
                        !!fieldState.error
                          ? "error"
                          : value && !loading
                          ? "inherit"
                          : "text.secondary"
                      }
                    >
                      Allow any platform user to join the event (public)
                    </Typography>
                  }
                  disabled={loading}
                />
              </FormGroup>
            )}
          /> */}
      </Stack>
    </Box>
  ) : null;
}

export default RegistrationStep;
