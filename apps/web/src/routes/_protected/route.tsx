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

import { DownloadCenter } from "@/components/DownloadCenter";
import { FirstLoadShell } from "@/components/FirstLoadShell";
import { Logo } from "@/components/Logo";
import { Navbar } from "@/components/Navbar";
import { ServerTime } from "@/components/ServerTime";
import { authClient } from "@/lib/auth-client";
import { hasCompleteAuthSession, isAdminSession } from "@/lib/auth-session";

export const Route = createFileRoute("/_protected")({
  beforeLoad: async ({ location }) => {
    const session = await authClient.getSession();
    const auth = session.data;

    if (!hasCompleteAuthSession(auth)) {
      throw redirect({
        to: "/login",
        replace: true,
        search: {
          redirect: location.href,
        },
      });
    }

    const maintenance = OpenFeature.getClient().getBooleanValue(
      "maintenance-mode",
      false,
    );

    if (maintenance && !isAdminSession(auth)) {
      await authClient.signOut();
      throw redirect({ to: "/login", replace: true });
    }
  },
  pendingComponent: FirstLoadShell,
  pendingMs: 0,
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({ from: "/" });
  const { data, isPending } = authClient.useSession();
  const { value: maintenanceMode } = useFlag("maintenance-mode", false);

  const [opened, { toggle }] = useDisclosure();
  const hasCompleteSession = hasCompleteAuthSession(data);
  const isNonAdminDuringMaintenance = maintenanceMode && !isAdminSession(data);

  useEffect(() => {
    if (isPending) return;

    if (!hasCompleteSession) {
      void navigate({ to: "/login", replace: true });
      return;
    }

    if (isNonAdminDuringMaintenance) {
      void authClient
        .signOut()
        .finally(() => navigate({ to: "/login", replace: true }));
    }
  }, [hasCompleteSession, isNonAdminDuringMaintenance, isPending, navigate]);

  if (isPending || !hasCompleteSession || isNonAdminDuringMaintenance) {
    return <FirstLoadShell />;
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
      padding={0}
    >
      <AppShell.Header>
        <Group
          align="center"
          h="100%"
          justify="space-between"
          px={{ base: "sm", sm: "md" }}
          w="100%"
        >
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
            <DownloadCenter />
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
