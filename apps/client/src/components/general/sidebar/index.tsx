import { DesktopSidebar } from "@app/components/general/sidebar/desktop";
import { MobileSidebar } from "@app/components/general/sidebar/mobile";

export function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}
