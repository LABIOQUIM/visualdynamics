import React, { useContext, useRef } from "react";

import { SidebarContent } from "@app/components/Sidebar/SidebarContent";
import { SidebarContext } from "@app/context/SidebarContext";

export function DesktopSidebar() {
  const sidebarRef = useRef(null);
  const { saveScroll } = useContext(SidebarContext);

  const linkClickedHandler = () => {
    saveScroll(sidebarRef.current);
  };

  return (
    <aside
      id="desktopSidebar"
      ref={sidebarRef}
      className="z-30 hidden w-64 flex-shrink-0 overflow-y-auto bg-white transition-all duration-150 dark:bg-gray-900 lg:block"
    >
      <SidebarContent linkClicked={linkClickedHandler} />
    </aside>
  );
}
