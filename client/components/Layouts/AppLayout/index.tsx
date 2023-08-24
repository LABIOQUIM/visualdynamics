"use client";
import { PropsWithChildren } from "react";
import { ToastContainer } from "react-toastify";
import dynamic from "next/dynamic";

import { Footer } from "@/components/Layouts/AppLayout/Footer";
import { Spinner } from "@/components/LoadingIndicators/Spinner";
import { Sidebar } from "@/components/Sidebar";
import { useSidebar } from "@/contexts/sidebar";

import "react-toastify/dist/ReactToastify.css";

const Header = dynamic(
  () =>
    import("@/components/Layouts/AppLayout/Header").then((mod) => mod.Header),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-20 w-full items-center justify-center">
        <Spinner />
      </div>
    )
  }
);

export function AppLayout({ children }: PropsWithChildren<unknown>) {
  const { isSidebarOpen } = useSidebar();

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
