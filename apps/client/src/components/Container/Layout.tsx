import { useContext } from "react";
import dynamic from "next/dynamic";

import { Main } from "@app/components/Container/Main";
import { Header } from "@app/components/Header";
import { SidebarContext, SidebarProvider } from "@app/context/SidebarContext";
import { useTheme } from "@app/context/ThemeContext";

import { Spinner } from "../Spinner";

const Sidebar = dynamic(
  () => import("@app/components/Sidebar").then((mod) => mod.Sidebar),
  {
    loading: () => (
      <div className="flex items-center justify-center w-64">
        <Spinner className="h-20 w-20" />
      </div>
    ),
    ssr: false
  }
);

interface ILayout {
  children: React.ReactNode;
}

export function Layout({ children }: ILayout) {
  const { isSidebarOpen } = useContext(SidebarContext);
  const { theme } = useTheme();

  return (
    <SidebarProvider>
      <div className={theme}>
        <div
          className={`flex h-screen bg-white dark:bg-gray-900 ${
            isSidebarOpen && "overflow-hidden"
          }`}
        >
          <Sidebar />
          <div className="flex flex-col flex-1 w-full">
            <Header />
            <Main>{children}</Main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
