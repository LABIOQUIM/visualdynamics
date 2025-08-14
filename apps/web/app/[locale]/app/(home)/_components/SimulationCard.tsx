"use client";
import {
  Badge,
  Button,
  Card,
  Divider,
  Skeleton,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconArrowRight,
  IconCircleOff,
  IconListDetails,
} from "@tabler/icons-react";
import { clsx } from "clsx";
import { Simulation } from "database";
import Link from "next/link";
import { useQueryState } from "nuqs";

import { QueryParams } from "@/app/_constants/queries";
import { RouteLinks } from "@/app/_constants/routes";
import { dateFormat } from "@/utils/dateFormat";

import classes from "./SimulationCard.module.css";

interface Props {
  simulation: Simulation | null;
  isLoading?: boolean;
  type?: "apo" | "acpype";
}

export function SimulationCard({ isLoading, simulation, type }: Props) {
  const [expanded, setExpanded] = useQueryState(
    QueryParams.SIMULATION_EXPANDED_DETAILS
  );

  const title = {
    apo: "Free Protein",
    acpype: "Protein + Ligand",
  };

  const subtitle = {
    apo: null,
    acpype: "Must be prepared in Bio2Byte's ACPYPE Server.",
  };

  if (isLoading && type) {
    return (
      <Card className={classes.container} withBorder>
        <div className={classes.headingContainer}>
          <div className={classes.headingSubContainer}>
            <Text className={classes.headingTitle}>{title[type]}</Text>
            <Skeleton height={20} width={88.59} radius="xl" />
          </div>
          {subtitle[type] ? (
            <Text className={classes.headingSubtitle}>{subtitle[type]}</Text>
          ) : null}
        </div>
        <Divider />
        <div className={classes.contentContainer}>
          <Skeleton height={24.8} radius="md" />
          <Skeleton height={24.8} radius="md" />
          <Skeleton height={24.8} radius="md" />
          <Skeleton height={24.8} radius="md" />
        </div>
        <Divider />
        <Skeleton height={30} radius="md" />
        <Skeleton height={30} radius="md" />
      </Card>
    );
  }

  if (!simulation) {
    return (
      <Card
        className={clsx(classes.container, classes.noSimulationContainer)}
        withBorder
      >
        <IconCircleOff size={48} />
        <Text fw={600} size="lg">
          No Simulation Yet
        </Text>
      </Card>
    );
  }

  const background = {
    QUEUED: "orange",
    ERRORED: "red",
    RUNNING: "indigo",
    COMPLETED: "green",
    CANCELED: "gray",
    GENERATED: "dark",
  };

  const isLinkDisabled = !["RUNNING", "QUEUED"].includes(simulation.status);

  return (
    <Card className={classes.container} withBorder>
      <div className={classes.headingContainer}>
        <div className={classes.headingSubContainer}>
          <Text className={classes.headingTitle}>{title[simulation.type]}</Text>
          <Badge color={background[simulation.status]}>
            {simulation.status || "Unknown"}
          </Badge>
        </div>
        {subtitle[simulation.type] ? (
          <Text className={classes.headingSubtitle}>
            {subtitle[simulation.type]}
          </Text>
        ) : null}
      </div>
      <Divider />
      <div className={classes.contentContainer}>
        <Text className={classes.contentText}>
          <strong>Type</strong>: {simulation.type.toUpperCase()}
        </Text>
        <Text className={classes.contentText}>
          <strong>Submitted At</strong>: {dateFormat(simulation.createdAt)}
        </Text>
        <Text className={classes.contentText}>
          <strong>Started At</strong>:{" "}
          {simulation.startedAt
            ? dateFormat(simulation.startedAt)
            : "Not Started Yet"}
        </Text>
        <Text className={classes.contentText}>
          <strong>Ended At</strong>:{" "}
          {simulation.endedAt
            ? dateFormat(simulation.endedAt)
            : "Not Ended Yet"}
        </Text>
      </div>
      <Divider />
      <Tooltip label="Only available when status is 'Running'" withArrow>
        <Button
          component={isLinkDisabled ? undefined : Link}
          href={`${RouteLinks.SIMULATIONS_RUNNING}/${simulation.id}`}
          disabled={isLinkDisabled}
          leftSection={<IconArrowRight />}
          color="cyan"
          size="xs"
          variant="outline"
          justify="start"
          fullWidth
        >
          View Run
        </Button>
      </Tooltip>
      <Button
        color="indigo"
        justify="start"
        leftSection={<IconListDetails />}
        onClick={() =>
          setExpanded(expanded === simulation.type ? null : simulation.type)
        }
        size="xs"
        variant={expanded === simulation.type ? "filled" : "outline"}
      >
        {expanded === simulation.type ? "Hide Details" : "View Details"}
      </Button>
    </Card>
  );
}
