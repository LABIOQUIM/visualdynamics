import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

import { Backdrop } from "@app/components/general/backdrop";
import { Spinner } from "@app/components/Spinner";
import { useSidebar } from "@app/context/SidebarContext";
import { useCloseSidebar } from "@app/hooks/use-close-sidebar";

const SidebarContent = dynamic(
  () =>
    import("@app/components/general/sidebar/content").then(
      (mod) => mod.SidebarContent
    ),
  {
    loading: () => (
      <div className="hidden w-80 items-center justify-center lg:flex">
        <Spinner className="h-20 w-20" />
      </div>
    ),
    ssr: false
  }
);

export function MobileSidebar() {
  useCloseSidebar();
  const { isSidebarOpen, closeSidebar } = useSidebar();

  return (
    <AnimatePresence mode="wait">
      {isSidebarOpen ? (
        <>
          <Backdrop onClick={closeSidebar} />
          <motion.aside
            key="nav-aside"
            className="fixed inset-y-0 z-50 mt-20 flex w-80 flex-shrink-0 flex-col gap-y-7 overflow-y-auto bg-white py-2.5 shadow-[0_0_0_-15px_rgba(0,0,0,0.3)] transition-all duration-150 dark:bg-zinc-900"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{
              ease: "easeInOut"
            }}
          >
            <SidebarContent />
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
