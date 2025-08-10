import { Anchor, Paper, Text } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

import { RouteLinks } from "@/app/_constants/routes";
import VISUAL_DYNAMICS_LOGO from "@/assets/visualdynamics.svg";
import { Login } from "@/components/Auth/Login/Login";
import { Heading } from "@/components/Heading/Heading";

import classes from "./page.module.css";

export default function LoginPage() {
  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form}>
        <Image
          alt="Visual Dynamics Logo"
          className={classes.logo}
          src={VISUAL_DYNAMICS_LOGO}
        />

        <Heading title="Login" />
        <Login />

        <Text ta="center" mt="md">
          Don&apos;t have an account?{" "}
          <Anchor component={Link} href={RouteLinks.REGISTER} fw={500}>
            Register
          </Anchor>
        </Text>
      </Paper>
    </div>
  );
}
