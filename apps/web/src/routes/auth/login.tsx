import classes from "./login.module.css";

import {
  Anchor,
  Box,
  Button,
  PasswordInput,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "preact/hooks";

import { Alert } from "@/components/Alert";
import { Heading } from "@/components/Heading";
import { authClient } from "@/lib/auth-client";

type FormInputs = {
  identifier: string;
  password: string;
};

export const Route = createFileRoute("/auth/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({ from: "/auth/login" });

  const [status, setStatus] = useState<FormSubmissionStatus>();
  const { getInputProps, onSubmit } = useForm<FormInputs>({
    initialValues: {
      identifier: "",
      password: "",
    },
    validate: {
      identifier: (value) =>
        value.length < 4
          ? "Your email and username both have more than 3 characters"
          : null,
      password: (value) =>
        value.length < 5
          ? "The password can't be less than 6 characters"
          : null,
    },
  });

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
    if (status && status.status !== "loading") {
      return <Alert status={status} />;
    }

    return (
      <Alert
        status={{
          status: "info",
          title: "Login to continue to Visual Dynamics.",
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
        onSubmit={onSubmit(doLogin)}
      >
        <RenderAlert />
        <TextInput
          data-autofocus
          disabled={status?.status === "loading"}
          label="Email or Username"
          withAsterisk
          {...getInputProps("identifier")}
        />
        <PasswordInput
          disabled={status?.status === "loading"}
          label="Password"
          type="password"
          withAsterisk
          {...getInputProps("password")}
        />

        <Button loading={status?.status === "loading"} type="submit">
          Login
        </Button>
      </Box>

      <Text ta="center">
        Don&apos;t have an account?{" "}
        <Anchor component={Link} fw={500} to="/auth/register">
          Register
        </Anchor>
      </Text>
    </>
  );
}
