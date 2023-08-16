import { Menu } from "lucide-react";

import { useSidebar } from "@/contexts/sidebar";

export function HamburgerMenu() {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      className="focus:shadow-outline-purple -ml-1 rounded-md p-1 focus:outline-none lg:hidden"
      onClick={toggleSidebar}
      aria-label="Menu"
    >
      <Menu
        className="h-6 w-6"
        aria-hidden="true"
      />
    </button>
  );
}
