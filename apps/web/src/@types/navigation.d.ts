import { MantineColor } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";
import type { LinkProps } from "@tanstack/react-router";

declare global {
  interface NavLink {
    icon: Icon;
    label: string;
    href:
      | LinkProps["to"]
      | "https://www.qsar.labioquim.fiocruz.br/"
      | "https://www.plasmoia.labioquim.fiocruz.br/";
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
