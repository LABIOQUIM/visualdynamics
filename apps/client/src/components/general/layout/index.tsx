import { PropsWithChildren, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { getCookie } from "cookies-next";
import dynamic from "next/dynamic";
import Router from "next/router";

import { Backdrop } from "@app/components/general/backdrop";
import { Footer } from "@app/components/general/layout/footer";
import { PageLoadingIndicator } from "@app/components/general/loading-indicator/full-page";
import { Spinner } from "@app/components/general/loading-indicator/spinner";
import { Sidebar } from "@app/components/general/sidebar";
import { useSidebar } from "@app/context/SidebarContext";
import {
  Theme,
  themeCookieKey,
  ThemeProvider
} from "@app/context/ThemeContext";
import { useSignOut } from "@app/hooks/use-sign-out";

import "react-toastify/dist/ReactToastify.css";

const Header = dynamic(
  () =>
    import("@app/components/general/layout/header").then((mod) => mod.Header),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-20 w-full flex-1 items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    )
  }
);

export function Layout({ children }: PropsWithChildren<unknown>) {
  useSignOut();
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const [isChangingRoute, setIsChangingRoute] = useState(false);

  useEffect(() => {
    const start = () => {
      closeSidebar();
      setIsChangingRoute(true);
    };
    const done = () => setIsChangingRoute(false);

    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", done);
    Router.events.on("routeChangeError", done);

    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", done);
      Router.events.off("routeChangeError", done);
    };
  }, [closeSidebar]);

  const defaultTheme = getCookie(themeCookieKey) ?? "light";

  return (
    <ThemeProvider defaultTheme={defaultTheme as Theme}>
      <div
        className={`h-screen bg-zinc-50 transition-all duration-150 dark:bg-zinc-900 ${
          isSidebarOpen && "overflow-hidden"
        }`}
      >
        <Header />
        <div className="flex min-h-[calc(100%-5rem)] lg:h-[calc(100%-5rem)]">
          <Sidebar />
          <main className="relative flex w-full flex-col justify-between bg-zinc-100 p-4 pb-2 text-zinc-800 transition-all duration-150 dark:bg-zinc-950 dark:text-zinc-100 lg:overflow-y-auto lg:rounded-tl-3xl lg:border-l lg:border-t lg:border-l-zinc-400 lg:border-t-zinc-400 lg:p-8 lg:pb-2 dark:lg:border-l-zinc-600 dark:lg:border-t-zinc-600">
            {children}
            {isChangingRoute ? (
              <Backdrop className="z-[100]">
                <PageLoadingIndicator />
              </Backdrop>
            ) : null}
            <Footer />
            <ToastContainer
              autoClose={2000}
              closeOnClick
              closeButton
              newestOnTop
              limit={3}
              theme="colored"
            />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
