import classes from "./route.module.css";

import { Box, Paper } from "@mantine/core";
import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";

import VISUAL_DYNAMICS_LOGO from "@/assets/visualdynamics.svg";
import { authClient } from "@/lib/auth-client";
import { hasCompleteAuthSession } from "@/lib/auth-session";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async () => {
    const session = await authClient.getSession();

    if (hasCompleteAuthSession(session.data)) {
      throw redirect({
        to: "/simulations",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({ from: "/" });
  const { data } = authClient.useSession();

  if (hasCompleteAuthSession(data)) {
    navigate({ to: "/simulations" });

    return (
      <Box className={classes.container}>
        <Paper className={classes.innerContainer}>
          <img alt="Visual Dynamics Logo" src={VISUAL_DYNAMICS_LOGO} />
        </Paper>
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <Paper className={classes.innerContainer}>
        <img alt="Visual Dynamics Logo" src={VISUAL_DYNAMICS_LOGO} />

        <Outlet />
      </Paper>
    </Box>
  );
}
