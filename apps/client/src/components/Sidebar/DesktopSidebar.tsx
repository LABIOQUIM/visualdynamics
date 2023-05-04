import React, { useRef } from "react";

import { SidebarContent } from "@app/components/Sidebar/SidebarContent";

export function DesktopSidebar() {
  const sidebarRef = useRef(null);

  return (
    <aside
      id="desktopSidebar"
      ref={sidebarRef}
      className="z-30 hidden w-64 flex-shrink-0 overflow-y-auto bg-white transition-all duration-150 dark:bg-zinc-900 lg:block"
    >
      <SidebarContent />
    </aside>
  );
}
