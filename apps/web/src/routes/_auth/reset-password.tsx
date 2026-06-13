import classes from "./reset-password.module.css";

import { useState } from "react";
import { Anchor, Box, Button, PasswordInput, Text } from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert } from "@/components/Alert";
import { Heading } from "@/components/Heading";
import { authClient } from "@/lib/auth-client";
import { passwordSchema } from "@/lib/password-validation";

const searchSchema = z.object({
  token: z.string().optional(),
});

const schema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormInputs = z.infer<typeof schema>;

export const Route = createFileRoute("/_auth/reset-password")({
  component: RouteComponent,
  validateSearch: searchSchema,
});

function RouteComponent() {
  const { token } = Route.useSearch();
  const [status, setStatus] = useState<FormSubmissionStatus>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({ resolver: zodResolver(schema) });

  async function doSubmit({ password }: FormInputs) {
    if (!token) {
      setStatus({
        status: "error",
        title: "Invalid reset link",
        message: "No reset token found in the URL.",
      });
      return;
    }

    setStatus({ status: "loading" });

    await authClient.resetPassword({
      newPassword: password,
      token,
      fetchOptions: {
        onSuccess: () => {
          setStatus({
            status: "success",
            title: "Password reset",
            message: "Your password has been reset. Redirecting to login...",
          });
          window.location.href = "/login";
        },
        onError: ({ error }) => {
          setStatus({
            status: "error",
            title: "Reset failed",
            message: error.message,
          });
        },
      },
    });
  }

  if (!token) {
    return (
      <>
        <Heading title="Reset password" />
        <Alert
          status={{
            status: "error",
            title: "Invalid reset link",
            message:
              "This password reset link is invalid or has expired. Please request a new one.",
          }}
        />
        <Text ta="center">
          <Anchor component={Link} fw={500} to="/forgot-password">
            Request a new reset link
          </Anchor>
        </Text>
      </>
    );
  }

  return (
    <>
      <Heading title="Reset password" />

      <Box
        className={classes.formContainer}
        component="form"
        onSubmit={handleSubmit(doSubmit)}
      >
        {status && status.status !== "loading" && <Alert status={status} />}

        <PasswordInput
          data-autofocus
          disabled={status?.status === "loading"}
          error={errors.password?.message}
          label="New password"
          withAsterisk
          {...register("password")}
        />

        <PasswordInput
          disabled={status?.status === "loading"}
          error={errors.confirmPassword?.message}
          label="Confirm new password"
          withAsterisk
          {...register("confirmPassword")}
        />

        <Button loading={status?.status === "loading"} type="submit">
          Reset password
        </Button>
      </Box>

      <Text ta="center">
        <Anchor component={Link} fw={500} to="/login">
          Back to login
        </Anchor>
      </Text>
    </>
  );
}
