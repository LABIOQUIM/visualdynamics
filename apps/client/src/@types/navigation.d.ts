import type { Icon } from "lucide-react";

declare global {
  type NavItem = {
    title: string;
    href: string;
    isExternal?: boolean;
    disabled?: boolean;
    icon?: Icon;
  };
}
