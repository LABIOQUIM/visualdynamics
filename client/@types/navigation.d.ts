import type { LucideIcon } from "lucide-react";

declare global {
  interface NavigationItem {
    label: string;
    href?: string;
    checkActive?: (pathname: string, item: NavigationItem) => boolean;
    links?: NavigationItem[];
    Icon?: LucideIcon;
    exact?: boolean;
  }

  interface NavigationSection {
    title: string;
    links: NavigationItem[];
    Icon?: LucideIcon;
  }
}
