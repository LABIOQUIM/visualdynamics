import type { LucideIcon } from "lucide-react";

declare global {
  interface NavigationItem {
    label: string;
    href?: string;
    links?: NavigationItem[];
    Icon?: LucideIcon;
  }

  interface NavigationSection {
    title: string;
    links: NavigationItem[];
    Icon?: LucideIcon;
  }
}
