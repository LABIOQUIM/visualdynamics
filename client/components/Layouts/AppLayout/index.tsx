"use client";
import { PropsWithChildren } from "react";
import { ToastContainer } from "react-toastify";
import { Construction } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

import { Footer } from "@/components/Layouts/AppLayout/Footer";
import { Header } from "@/components/Layouts/AppLayout/Header";
import { Sidebar } from "@/components/Sidebar";
import { useSettings } from "@/contexts/settings";
import { useSidebar } from "@/contexts/sidebar";

import "react-toastify/dist/ReactToastify.css";

export function AppLayout({ children }: PropsWithChildren<unknown>) {
  const { isSidebarOpen } = useSidebar();
  const { maintenanceMode } = useSettings();
  const { t } = useTranslation();

  return (
    <div
      className={`h-screen bg-zinc-50 transition-all duration-150 dark:bg-zinc-900 ${
        isSidebarOpen && "overflow-hidden"
      }`}
    >
      <Header />
      <div className="flex min-h-[calc(100%-5rem)] lg:h-[calc(100%-5rem)]">
        <Sidebar />
        <main className="relative flex w-full flex-col justify-between bg-zinc-100 p-4 pb-2 text-zinc-800 transition-all duration-150 dark:bg-zinc-950 dark:text-zinc-100 lg:overflow-y-auto lg:rounded-tl-3xl lg:border-l lg:border-t lg:border-l-zinc-400 lg:border-t-zinc-400 lg:p-8 lg:pb-2 dark:lg:border-l-zinc-600 dark:lg:border-t-zinc-600">
          {maintenanceMode ? (
            <div className="flex w-full justify-center gap-2 text-neutral-700 dark:text-neutral-100">
              <Construction className="min-h-[1.75rem] min-w-[1.75rem]" />
              {t("common:maintenance")}
            </div>
          ) : null}
          {children}
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
  );
}
