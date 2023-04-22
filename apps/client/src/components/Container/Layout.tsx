import { useContext } from "react";

import { Main } from "@app/components/Container/Main";
import { Header } from "@app/components/Header";
import { SidebarContext, SidebarProvider } from "@app/context/SidebarContext";
import { useTheme } from "@app/context/ThemeContext";

import { Sidebar } from "../Sidebar";

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
          className={`transition-all duration-150 flex h-screen bg-white dark:bg-gray-900 ${
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
