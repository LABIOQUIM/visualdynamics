import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";

import { Backdrop } from "@app/components/Backdrop";
import { SidebarContent } from "@app/components/Sidebar/SidebarContent";
import { useSidebar } from "@app/context/SidebarContext";
import { useCloseSidebar } from "@app/hooks/useCloseSidebar";

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
            className="fixed inset-y-0 z-50 mt-[4.5rem] flex w-64 flex-shrink-0 flex-col gap-y-7 overflow-y-auto bg-white py-2.5 shadow-[0_0_0_-15px_rgba(0,0,0,0.3)] transition-all duration-150 dark:bg-zinc-900"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
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
