"use client";

import { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";

import { SettingsProvider } from "@/contexts/settings";
import { SidebarProvider } from "@/contexts/sidebar";
import { Theme, ThemeProvider } from "@/contexts/theme";
import { queryClient } from "@/lib/queryClient";
import { I18nProviderClient } from "@/locales/client";

type Props = {
  locale: string;
  defaultTheme: Theme;
  toggleThemeCookie: () => Promise<Theme>;
};

export function Providers({
  children,
  defaultTheme,
  locale,
  toggleThemeCookie
}: PropsWithChildren<Props>) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <I18nProviderClient locale={locale}>
          <ThemeProvider
            defaultTheme={defaultTheme}
            toggleThemeCookie={toggleThemeCookie}
          >
            <SidebarProvider>
              <SettingsProvider>{children}</SettingsProvider>
            </SidebarProvider>
          </ThemeProvider>
        </I18nProviderClient>
      </QueryClientProvider>
    </SessionProvider>
  );
}
