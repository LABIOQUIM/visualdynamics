import { DesktopSidebar } from "@/components/Sidebar/Desktop";
import { MobileSidebar } from "@/components/Sidebar/Mobile";

export function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}
