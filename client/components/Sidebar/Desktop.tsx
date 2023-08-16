import dynamic from "next/dynamic";

const Content = dynamic(
  () =>
    import("@/components/Sidebar/Content").then((mod) => mod.SidebarContent),
  {
    ssr: false
  }
);

export function DesktopSidebar() {
  return (
    <aside
      id="desktopSidebar"
      className="z-30 hidden w-72 flex-shrink-0 overflow-y-auto bg-white transition-all duration-150 dark:bg-zinc-900 lg:mr-0.5 lg:block"
    >
      <Content />
    </aside>
  );
}
