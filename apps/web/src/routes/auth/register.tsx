import classes from "./register.module.css";

import {
  Anchor,
  Box,
  Button,
  Group,
  PasswordInput,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "preact/hooks";

import { Alert } from "@/components/Alert";
import { Heading } from "@/components/Heading";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/auth/register")({
  component: RouteComponent,
});

function RouteComponent() {
  const [status, setStatus] = useState<FormSubmissionStatus>();
  const { getInputProps, onSubmit } = useForm<RegisterFormInputs>({
    initialValues: {
      email: "",
      firstName: "",
      password: "",
      userName: "",
      lastName: "",
    },
    validate: {
      email: (value) => (value.length < 8 ? "Invalid email" : null),
      firstName: (value) =>
        value.length < 2 ? "Please enter your first name" : null,
      lastName: (value) =>
        value.length < 2 ? "Please enter your last name" : null,
      password: (value) =>
        value.length < 6
          ? "Your password must have mor than 5 characters"
          : null,
      userName: (value) =>
        value.length < 4
          ? "Your username must have more than 3 characters"
          : null,
    },
  });

  async function doRegister(form: RegisterFormInputs) {
    setStatus({ status: "loading" });

    await authClient.signUp.email(
      {
        name: `${form.firstName} ${form.lastName}`,
        firstName: form.firstName,
        userName: form.userName,
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

      <Box
        className={classes.formContainer}
        component="form"
        onSubmit={onSubmit(doRegister)}
      >
        {status && status.status !== "loading" && <Alert status={status} />}
        <Group gap="sm" w="100%">
          <TextInput
            disabled={status?.status === "loading"}
            label="First Name"
            placeholder="e.g.: John"
            style={{ flex: 1 }}
            withAsterisk
            {...getInputProps("firstName")}
          />
          <TextInput
            disabled={status?.status === "loading"}
            label="Last Name"
            placeholder="e.g.: Doe"
            style={{ flex: 1 }}
            withAsterisk
            {...getInputProps("lastName")}
          />
        </Group>
        <TextInput
          disabled={status?.status === "loading"}
          label="Username"
          placeholder="e.g.: johndoe"
          withAsterisk
          {...getInputProps("userName")}
        />
        <TextInput
          disabled={status?.status === "loading"}
          label="Email"
          placeholder="e.g.: john@doe.com"
          withAsterisk
          {...getInputProps("email")}
        />
        <PasswordInput
          disabled={status?.status === "loading"}
          label="Password"
          placeholder="******"
          type="password"
          withAsterisk
          {...getInputProps("password")}
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
  );
}
