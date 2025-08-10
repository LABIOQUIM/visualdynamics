"use client";
import { Button, Menu } from "@mantine/core";
import { IconAtom2, IconCell, IconChevronDown } from "@tabler/icons-react";
import Link from "next/link";

import { RouteLinks } from "@/app/_constants/routes";

import classes from "./NewSimulationButton.module.css";

export function NewSimulationButton() {
  return (
    <Menu
      transitionProps={{ transition: "pop-top-right" }}
      position="bottom"
      withinPortal
      radius="md"
    >
      <Menu.Target>
        <Button
          rightSection={<IconChevronDown size={18} stroke={1.5} />}
          radius="md"
        >
          New Simulation
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          component={Link}
          href={RouteLinks.SIMULATIONS_APO}
          leftSection={
            <IconCell className={classes.iconAPO} size={16} stroke={1.5} />
          }
        >
          Free Protein
        </Menu.Item>
        <Menu.Item
          component={Link}
          href={RouteLinks.SIMULATIONS_ACPYPE}
          leftSection={
            <IconAtom2 className={classes.iconACPYPE} size={16} stroke={1.5} />
          }
        >
          Protein + Ligand
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
