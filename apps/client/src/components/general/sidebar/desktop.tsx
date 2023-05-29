import dynamic from "next/dynamic";

import { Spinner } from "@app/components/Spinner";

const SidebarContent = dynamic(
  () =>
    import("@app/components/general/sidebar/content").then(
      (mod) => mod.SidebarContent
    ),
  {
    loading: () => (
      <div className="hidden w-72 items-center justify-center lg:flex">
        <Spinner className="h-20 w-20" />
      </div>
    ),
    ssr: false
  }
);

export function DesktopSidebar() {
  return (
    <aside
      id="desktopSidebar"
      className="z-30 hidden w-72 flex-shrink-0 overflow-y-auto bg-white transition-all duration-150 dark:bg-zinc-900 lg:mr-0.5 lg:block"
    >
      <SidebarContent />
    </aside>
  );
}
