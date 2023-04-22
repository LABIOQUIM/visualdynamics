import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { useSidebar } from "@app/context/SidebarContext";

export function useCloseSidebar() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const router = useRouter();
  const { closeSidebar } = useSidebar();

  useEffect(() => {
    if (pathname !== router.pathname) {
      closeSidebar();
    }
    setPathname(router.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);
}
