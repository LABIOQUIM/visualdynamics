import { Anchor, Paper, Text } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

import { RouteLinks } from "@/app/_constants/routes";
import VISUAL_DYNAMICS_LOGO from "@/assets/visualdynamics.svg";
import { Register } from "@/components/Auth/Register/Register";
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

        <Heading title="Register" />

        <Register />

        <Text ta="center" mt="md">
          Already have an account?{" "}
          <Anchor component={Link} href={RouteLinks.LOGIN} fw={500}>
            Login
          </Anchor>
        </Text>
      </Paper>
    </div>
  );
}
