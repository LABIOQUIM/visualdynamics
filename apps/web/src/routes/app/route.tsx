import "mantine-react-table-open/styles.css";
import "@mantine/dropzone/styles.css";
import classes from "./route.module.css";

import { AppShell, Burger, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
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
  beforeLoad: ({ context, location }) => {
    if (!context.auth) {
      throw redirect({
        to: "/auth/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({ from: "/app" });
  const { data } = authClient.useSession();

  const [opened, { toggle }] = useDisclosure();

  if (!data) {
    navigate({ to: "/auth/login" });

    return "test";
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
