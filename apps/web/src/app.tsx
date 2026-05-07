import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";

import type { ComponentProps } from "react";
import { Loader, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";

import type { RouterContext } from "./routes/__root";
import { theme } from "./theme";

type AppRouterProps = {
  auth: RouterContext["auth"];
  router: ComponentProps<typeof RouterProvider>["router"];
  withNotifications?: boolean;
};

export function AppRouter({
  auth,
  router,
  withNotifications = true,
}: AppRouterProps) {
  return (
    <MantineProvider theme={theme}>
      {withNotifications ? <Notifications /> : null}
      <QueryClientProvider client={router.options.context.queryClient}>
        <RouterProvider context={{ auth }} router={router} />
      </QueryClientProvider>
    </MantineProvider>
  );
}

export function ClientLoader() {
  return <Loader />;
}
