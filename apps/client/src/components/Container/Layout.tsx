import { useContext, useEffect, useState } from "react";
import Router from "next/router";

import { Backdrop } from "@app/components/Backdrop";
import { Main } from "@app/components/Container/Main";
import { FullPageLoader } from "@app/components/FullPageLoader";
import { Header } from "@app/components/Header";
import { Sidebar } from "@app/components/Sidebar";
import { SidebarContext, SidebarProvider } from "@app/context/SidebarContext";
import { useTheme } from "@app/context/ThemeContext";
import { useSignOut } from "@app/hooks/useSignOut";

interface ILayout {
  children: React.ReactNode;
}

export function Layout({ children }: ILayout) {
  useSignOut();
  const { isSidebarOpen } = useContext(SidebarContext);
  const { theme } = useTheme();
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

  return (
    <SidebarProvider>
      {isChangingRoute ? (
        <Backdrop className="z-[100] transition-all duration-150">
          <FullPageLoader />
        </Backdrop>
      ) : null}
      <div
        className={`h-screen ${theme} ${isSidebarOpen && "overflow-hidden"}`}
      >
        <div
          className={`flex min-h-full flex-1 flex-col bg-white transition-all duration-150 dark:bg-zinc-900 lg:h-full`}
        >
          <Header />
          <div className="flex flex-1 lg:overflow-y-hidden">
            <Sidebar />
            <Main>{children}</Main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
