import { useContext } from "react";

import { Main } from "@app/components/Container/Main";
import { Header } from "@app/components/Header";
import { Sidebar } from "@app/components/Sidebar";
import { SidebarContext, SidebarProvider } from "@app/context/SidebarContext";
import { useTheme } from "@app/context/ThemeContext";

interface ILayout {
  children: React.ReactNode;
}

export function Layout({ children }: ILayout) {
  const { isSidebarOpen } = useContext(SidebarContext);
  const { theme } = useTheme();

  return (
    <SidebarProvider>
      <div
        className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${
          isSidebarOpen && "overflow-hidden"
        }`}
        data-theme={theme}
      >
        <Sidebar />
        <div className="flex flex-col flex-1 w-full">
          <Header />
          <Main>{children}</Main>
        </div>
      </div>
    </SidebarProvider>
  );
}
