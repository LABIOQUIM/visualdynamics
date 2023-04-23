import dynamic from "next/dynamic";

import { Spinner } from "@app/components/Spinner";

const DesktopSidebar = dynamic(
  () =>
    import("@app/components/Sidebar/DesktopSidebar").then(
      (mod) => mod.DesktopSidebar
    ),
  {
    loading: () => (
      <div className="hidden w-64 items-center justify-center lg:flex">
        <Spinner className="h-20 w-20" />
      </div>
    ),
    ssr: false
  }
);

const MobileSidebar = dynamic(
  () =>
    import("@app/components/Sidebar/MobileSidebar").then(
      (mod) => mod.MobileSidebar
    ),
  {
    ssr: false
  }
);

export function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}
