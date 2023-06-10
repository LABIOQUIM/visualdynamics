import { AnimatePresence, LazyMotion, m } from "framer-motion";
import dynamic from "next/dynamic";

import { Spinner } from "@app/components/general/loading-indicator/spinner";
import { useSidebar } from "@app/context/SidebarContext";

const SidebarContent = dynamic(
  () =>
    import("@app/components/general/sidebar/content").then(
      (mod) => mod.SidebarContent
    ),
  {
    loading: () => (
      <div className="hidden w-full items-center justify-center lg:flex">
        <Spinner className="h-20 w-20" />
      </div>
    ),
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
            import("@app/utils/load-motion-features").then((res) => res.default)
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
            <SidebarContent />
          </m.aside>
        </LazyMotion>
      ) : null}
    </AnimatePresence>
  );
}
