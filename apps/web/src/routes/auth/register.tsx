import classes from "./register.module.css";

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
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert } from "@/components/Alert";
import { Heading } from "@/components/Heading";
import { authClient } from "@/lib/auth-client";

const schema = z.object({
  email: z.string().min(8, "Invalid email"),
  name: z.string().min(2, "Please enter your last name"),
  password: z.string().min(6, "Your password must have more than 5 characters"),
  username: z.string().min(4, "Your username must have more than 3 characters"),
});

export const Route = createFileRoute("/auth/register")({
  component: RouteComponent,
});

function RouteComponent() {
  const { value: signupsEnabled } = useFlag("signups-enabled", false);
  const [status, setStatus] = useState<FormSubmissionStatus>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({ resolver: zodResolver(schema) });

  async function doRegister(form: RegisterFormInputs) {
    setStatus({ status: "loading" });

    await authClient.signUp.email(
      {
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
      },
      {
        onError: ({ error }) => {
          console.log(error);
          setStatus({ status: "error", title: error.message });
        },
        onSuccess: () => {
          setStatus({
            status: "success",
            title: "Registration successful!",
            message: "Please check your email to verify your account.",
          });
        },
      },
    );
  }

  return (
    <>
      <Heading title="Register" />

      {!signupsEnabled ? (
        <>
          <Alert
            status={{
              status: "error",
              title: "Sign ups are currently disabled.",
              message: "Please check back later or contact an administrator.",
            }}
          />
          <Text ta="center">
            Already have an account?{" "}
            <Anchor component={Link} fw={500} to="/auth/login">
              Login
            </Anchor>
          </Text>
        </>
      ) : (
        <>
          <Box
            className={classes.formContainer}
            component="form"
            onSubmit={handleSubmit(doRegister)}
          >
            {status && status.status !== "loading" && <Alert status={status} />}
            <TextInput
              disabled={status?.status === "loading"}
              error={errors.name?.message}
              label="Name"
              placeholder="e.g.: John Meyer"
              withAsterisk
              {...register("name")}
            />
            <TextInput
              disabled={status?.status === "loading"}
              error={errors.username?.message}
              label="Username"
              placeholder="e.g.: johnmeyer"
              withAsterisk
              {...register("username")}
            />
            <TextInput
              disabled={status?.status === "loading"}
              error={errors.email?.message}
              label="Email"
              placeholder="e.g.: john@doe.com"
              withAsterisk
              {...register("email")}
            />
            <PasswordInput
              disabled={status?.status === "loading"}
              error={errors.password?.message}
              label="Password"
              placeholder="******"
              type="password"
              withAsterisk
              {...register("password")}
            />

            <Button loading={status?.status === "loading"} type="submit">
              Register
            </Button>
          </Box>

          <Text ta="center">
            Already have an account?{" "}
            <Anchor component={Link} fw={500} to="/auth/login">
              Login
            </Anchor>
          </Text>
        </>
      )}
    </>
  );
}
