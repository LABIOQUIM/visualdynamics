import React, { useRef } from "react";

import { useSidebar } from "@app/context/SidebarContext";
import { useCloseSidebar } from "@app/hooks/useCloseSidebar";

import { Backdrop } from "../Backdrop";
import { Transition } from "../Transition";

import { SidebarContent } from "./SidebarContent";

export function MobileSidebar() {
  useCloseSidebar();
  const sidebarRef = useRef(null);
  const { isSidebarOpen, closeSidebar, saveScroll } = useSidebar();

  const linkClickedHandler = () => {
    saveScroll(sidebarRef.current);
  };

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
            className="fixed inset-y-0 z-50 flex-shrink-0 w-64 mt-16 overflow-y-auto bg-white dark:bg-gray-900 lg:hidden"
          >
            <SidebarContent linkClicked={linkClickedHandler} />
          </aside>
        </Transition>
      </>
    </Transition>
  );
}
