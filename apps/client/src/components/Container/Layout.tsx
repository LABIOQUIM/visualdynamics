import { useContext } from "react";

import { Main } from "@app/components/Container/Main";
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

  return (
    <SidebarProvider>
      <div
        className={`h-screen ${theme} ${isSidebarOpen && "overflow-hidden"}`}
      >
        <div
          className={`flex min-h-full flex-1 flex-col bg-white transition-all duration-150 dark:bg-gray-900 lg:h-full`}
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
