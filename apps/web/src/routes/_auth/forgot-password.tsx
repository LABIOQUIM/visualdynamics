import classes from "./forgot-password.module.css";

import { useState } from "react";
import { Anchor, Box, Button, Text, TextInput } from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert } from "@/components/Alert";
import { Heading } from "@/components/Heading";
import { authClient } from "@/lib/auth-client";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormInputs = z.infer<typeof schema>;

export const Route = createFileRoute("/_auth/forgot-password")({
  component: RouteComponent,
});

function RouteComponent() {
  const [status, setStatus] = useState<FormSubmissionStatus>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({ resolver: zodResolver(schema) });

  async function doSubmit({ email }: FormInputs) {
    setStatus({ status: "loading" });

    await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
      fetchOptions: {
        onSuccess: () => {
          setStatus({
            status: "success",
            title: "Check your email",
            message:
              "If an account with that email exists, you will receive a password reset link shortly.",
          });
        },
        onError: ({ error }) => {
          setStatus({
            status: "error",
            title: "Something went wrong",
            message: error.message,
          });
        },
      },
    });
  }

  return (
    <>
      <Heading title="Forgot password" />

      <Box
        className={classes.formContainer}
        component="form"
        onSubmit={handleSubmit(doSubmit)}
      >
        {status && status.status !== "loading" && <Alert status={status} />}

        <TextInput
          data-autofocus
          disabled={status?.status === "loading"}
          error={errors.email?.message}
          label="Email"
          placeholder="e.g.: john@doe.com"
          type="email"
          withAsterisk
          {...register("email")}
        />

        <Button loading={status?.status === "loading"} type="submit">
          Send reset link
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
