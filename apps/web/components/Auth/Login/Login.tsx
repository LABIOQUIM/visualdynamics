"use client";
import { useState } from "react";
import { Box, Button, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter, useSearchParams } from "next/navigation";

import { login } from "@/actions/auth/login";
import { RouteLinks } from "@/app/_constants/routes";
import { Alert } from "@/components/Alerts/Alert";
import { useReloadAuth } from "@/hooks/auth/useReloadAuth";
import { normalizeString } from "@/utils/normalizeString";

import classes from "./Login.module.css";

interface FormInputs {
  userName: string;
  password: string;
}

export function Login() {
  const router = useRouter();
  const reload = useReloadAuth();
  const searchParamFrom = useSearchParams().get("from");
  const showFromEmailValidationAlert = searchParamFrom === "email-validation";

  const [status, setStatus] = useState<FormSubmissionStatus>();
  const { getInputProps, onSubmit } = useForm<FormInputs>({
    initialValues: {
      userName: "",
      password: "",
    },
    validate: {
      userName: (value) =>
        normalizeString(value).length < 4
          ? "Your email and username both have more than 3 characters"
          : null,
      password: (value) =>
        normalizeString(value).length < 5
          ? "The password can't be less than 6 characters"
          : null,
    },
  });

  async function doLogin({ userName, password }: FormInputs) {
    setStatus({ status: "loading" });
    login(userName, password).then((res) => {
      if (res === "invalid-credentials") {
        setStatus({
          status: "warning",
          title: "Username or Password incorrect.",
        });
      } else if (res === "awaiting-activation") {
        setStatus({
          status: "warning",
          title:
            "This account isn't activated. Check your email inbox and spam.",
        });
      } else if (res === "inactive") {
        setStatus({
          status: "error",
          title: "This account has been disabled by an administrator",
        });
      } else if (res === "unknown-error") {
        setStatus({
          status: "error",
          title: "Something went wrong. Please report to the administrators.",
        });
      } else {
        setStatus({ status: "success", title: "You've been signed-in" });
        reload().then(() => router.replace(RouteLinks.SIMULATIONS));
      }
    });
  }

  let RenderAlert = () => (
    <Alert
      status={{
        status: "info",
        title: "Login to continue to Visual Dynamics.",
      }}
    />
  );

  if (showFromEmailValidationAlert) {
    RenderAlert = () => (
      <Alert
        status={{
          status: "info",
          title: "Your email has been validated",
          message: "Your can now login and use Visual Dynamics",
        }}
      />
    );
  } else if (status && status.status !== "loading") {
    RenderAlert = () => <Alert status={status} />;
  }

  return (
    <Box
      component="form"
      className={classes.formContainer}
      onSubmit={onSubmit(doLogin)}
    >
      <RenderAlert />
      <TextInput
        data-autofocus
        disabled={status?.status === "loading"}
        label="Username"
        withAsterisk
        {...getInputProps("userName")}
      />
      <PasswordInput
        disabled={status?.status === "loading"}
        label="Password"
        withAsterisk
        type="password"
        {...getInputProps("password")}
      />

      <Button loading={status?.status === "loading"} type="submit">
        Login
      </Button>
    </Box>
  );
}
