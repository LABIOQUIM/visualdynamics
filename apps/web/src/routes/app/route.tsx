import "mantine-react-table-open/styles.css";
import "@mantine/dropzone/styles.css";
import classes from "./route.module.css";

import { useEffect } from "react";
import { AppShell, Burger, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { OpenFeature, useFlag } from "@openfeature/react-sdk";
import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";

import { Logo } from "@/components/Logo";
import { Navbar } from "@/components/Navbar";
import { ServerTime } from "@/components/ServerTime";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/app")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const session = await authClient.getSession();
    const auth = session.data;

    if (!auth) {
      throw redirect({
        to: "/auth/login",
        search: {
          redirect: location.href,
        },
      });
    }

    const maintenance = OpenFeature.getClient().getBooleanValue(
      "maintenance-mode",
      true,
    );

    if (maintenance && auth.user.role !== "admin") {
      throw redirect({ to: "/auth/login" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({ from: "/app" });
  const { data } = authClient.useSession();
  const { value: maintenanceMode } = useFlag("maintenance-mode", true);

  const isNonAdminDuringMaintenance =
    maintenanceMode && data?.user.role !== "admin";

  useEffect(() => {
    if (isNonAdminDuringMaintenance) {
      void authClient.signOut().then(() => navigate({ to: "/auth/login" }));
    }
  }, [isNonAdminDuringMaintenance, navigate]);

  const [opened, { toggle }] = useDisclosure();

  if (!data || isNonAdminDuringMaintenance) {
    return null;
  }

  return (
    <AppShell
      classNames={{
        root: classes.rootContainer,
        main: classes.mainContainer,
        footer: classes.footer,
      }}
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group align="center" h="100%" justify="space-between" px="md" w="100%">
          <Group flex={1}>
            <Burger
              hiddenFrom="sm"
              onClick={toggle}
              opened={opened}
              size="sm"
            />
            <Logo />
          </Group>
          <Group>
            {/*<SystemsStatus />*/}
            <ServerTime />
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar px="md">
        <Navbar toggle={toggle} />
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
