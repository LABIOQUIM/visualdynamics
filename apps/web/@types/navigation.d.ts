import { MantineColor } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";
import type { USER_ROLE } from "database";

declare global {
  interface NavLink {
    icon: Icon;
    label: string;
    href: string;
    external?: boolean;
    disabled?: boolean;
    role?: USER_ROLE;
    badge?: {
      color: MantineColor;
      message: string;
    };
  }

  interface NavSection {
    title: string;
    links: NavLink[];
    disabled?: boolean;
  }
}
