"use client";
import { AnimatePresence, LazyMotion, m } from "framer-motion";
import dynamic from "next/dynamic";

import { useSidebar } from "@/contexts/sidebar";

const Content = dynamic(
  () =>
    import("@/components/Sidebar/Content").then((mod) => mod.SidebarContent),
  {
    ssr: false
  }
);

export function MobileSidebar() {
  const { isSidebarOpen } = useSidebar();

  return (
    <AnimatePresence mode="wait">
      {isSidebarOpen ? (
        <LazyMotion
          features={() =>
            import("@/utils/loadMotionFeatures").then((res) => res.default)
          }
        >
          <m.aside
            key="nav-aside"
            className="fixed inset-y-0 z-50 mt-20 flex w-full flex-shrink-0 flex-col gap-y-7 overflow-y-auto bg-white py-2.5 shadow-[0_0_0_-15px_rgba(0,0,0,0.3)] transition-all duration-150 dark:bg-zinc-900"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              ease: "easeInOut"
            }}
          >
            <Content />
          </m.aside>
        </LazyMotion>
      ) : null}
    </AnimatePresence>
  );
}
