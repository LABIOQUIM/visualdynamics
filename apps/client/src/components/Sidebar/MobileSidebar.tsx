import React, { useRef } from "react";

import { Backdrop } from "@app/components/Backdrop";
import { SidebarContent } from "@app/components/Sidebar/SidebarContent";
import { Transition } from "@app/components/Transition";
import { useSidebar } from "@app/context/SidebarContext";
import { useCloseSidebar } from "@app/hooks/useCloseSidebar";

export function MobileSidebar() {
  useCloseSidebar();
  const sidebarRef = useRef(null);
  const { isSidebarOpen, closeSidebar } = useSidebar();

  return (
    <Transition show={isSidebarOpen}>
      <>
        <Transition
          enter="transition ease-in-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition ease-in-out duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Backdrop onClick={closeSidebar} />
        </Transition>

        <Transition
          enter="transition ease-in-out duration-150"
          enterFrom="opacity-0 transform -translate-x-20"
          enterTo="opacity-100"
          leave="transition ease-in-out duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0 transform -translate-x-20"
        >
          <aside
            id="mobileSidebar"
            ref={sidebarRef}
            className="fixed inset-y-0 z-50 mt-[4.5rem] w-64 flex-shrink-0 overflow-y-auto bg-white transition-all duration-150 dark:bg-zinc-900 lg:hidden"
          >
            <SidebarContent />
          </aside>
        </Transition>
      </>
    </Transition>
  );
}
