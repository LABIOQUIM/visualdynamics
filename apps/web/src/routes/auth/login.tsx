import classes from "./login.module.css";

import { useState } from "react";
import {
  Anchor,
  Box,
  Button,
  PasswordInput,
  Text,
  TextInput,
} from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFlag } from "@openfeature/react-sdk";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert } from "@/components/Alert";
import { Heading } from "@/components/Heading";
import { authClient } from "@/lib/auth-client";

const schema = z.object({
  identifier: z.string().min(4, "Your email and username both have more than 3 characters"),
  password: z.string().min(6, "The password can't be less than 6 characters"),
});

type FormInputs = z.infer<typeof schema>;

export const Route = createFileRoute("/auth/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({ from: "/auth/login" });
  const { value: signupsEnabled } = useFlag("signups-enabled", false);
  const { value: maintenanceMode } = useFlag("maintenance-mode", true);

  const [status, setStatus] = useState<FormSubmissionStatus>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({ resolver: zodResolver(schema) });

  async function doLogin({ identifier, password }: FormInputs) {
    setStatus({ status: "loading" });
    const regex = /\S+@\S+\.\S+/;

    const options: {
      onSuccess: () => void;
      onError: ({ error }: { error: any }) => void;
    } = {
      onSuccess: () => {
        setStatus({
          status: "success",
          title: "Login successful",
          message: "Redirecting to Visual Dynamics...",
        });
        navigate({ to: "/app" });
      },
      onError: ({ error }) => {
        console.log(error);
        setStatus({
          status: "error",
          title: "Login failed",
          message: error.message,
        });
      },
    };

    if (regex.test(identifier)) {
      await authClient.signIn.email({ email: identifier, password }, options);
    } else {
      await authClient.signIn.username(
        { username: identifier, password },
        options,
      );
    }
  }

  function RenderAlert() {
    if (maintenanceMode) {
      return (
        <Alert
          status={{
            status: "error",
            title: "System under maintenance",
            message:
              "Only administrators can sign in at this time. Please check back later.",
          }}
        />
      );
    }

    if (status && status.status !== "loading") {
      return <Alert status={status} />;
    }

    return (
      <Alert
        status={{
          status: "info",
          title: "Login to continue",
          message:
            "To access the totality of the system you need to be logged in.",
        }}
      />
    );
  }

  return (
    <>
      <Heading title="Login" />

      <Box
        className={classes.formContainer}
        component="form"
        onSubmit={handleSubmit(doLogin)}
      >
        <RenderAlert />
        <TextInput
          data-autofocus
          disabled={status?.status === "loading"}
          error={errors.identifier?.message}
          label="Email or Username"
          withAsterisk
          {...register("identifier")}
        />
        <PasswordInput
          disabled={status?.status === "loading"}
          error={errors.password?.message}
          label="Password"
          type="password"
          withAsterisk
          {...register("password")}
        />

        <Button loading={status?.status === "loading"} type="submit">
          Login
        </Button>
      </Box>

      <Text ta="center">
        Don&apos;t have an account?{" "}
        {signupsEnabled ? (
          <Anchor component={Link} fw={500} to="/auth/register">
            Register
          </Anchor>
        ) : (
          <Text c="dimmed" component="span" fw={500}>
            Sign ups are currently disabled.
          </Text>
        )}
      </Text>
    </>
  );
}
