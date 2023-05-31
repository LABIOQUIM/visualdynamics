import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import Router from "next/router";

import { Backdrop } from "@app/components/general/backdrop";
import { Header } from "@app/components/general/layout/header";
import { Sidebar } from "@app/components/general/sidebar";
import { PageLoadingIndicator } from "@app/components/Loading/PageLoadingIndicator";
import { SidebarProvider, useSidebar } from "@app/context/SidebarContext";
import {
  Theme,
  themeCookieKey,
  ThemeProvider
} from "@app/context/ThemeContext";
import { useSignOut } from "@app/hooks/use-sign-out";

interface ILayout {
  children: React.ReactNode;
}

export function Layout({ children }: ILayout) {
  useSignOut();
  const { isSidebarOpen } = useSidebar();
  const [isChangingRoute, setIsChangingRoute] = useState(false);

  useEffect(() => {
    const start = () => setIsChangingRoute(true);
    const done = () => setIsChangingRoute(false);

    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", done);
    Router.events.on("routeChangeError", done);

    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", done);
      Router.events.off("routeChangeError", done);
    };
  }, []);

  const defaultTheme = getCookie(themeCookieKey) ?? "light";

  return (
    <ThemeProvider defaultTheme={defaultTheme as Theme}>
      <SidebarProvider>
        {isChangingRoute ? (
          <Backdrop className="z-[100] transition-all duration-150">
            <PageLoadingIndicator />
          </Backdrop>
        ) : null}
        <div
          className={`h-screen bg-zinc-50 transition-all duration-150 dark:bg-zinc-900 ${
            isSidebarOpen && "overflow-hidden"
          }`}
        >
          <Header />
          <div className="flex min-h-[calc(100%-5rem)]">
            <Sidebar />
            <main className="w-full space-y-4 bg-zinc-100 p-4 text-zinc-800 transition-all duration-150 dark:bg-zinc-950 dark:text-zinc-100 lg:overflow-y-auto lg:rounded-tl-3xl lg:border-l lg:border-t lg:border-l-zinc-400 lg:border-t-zinc-400 lg:p-8 dark:lg:border-l-zinc-600 dark:lg:border-t-zinc-600">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
