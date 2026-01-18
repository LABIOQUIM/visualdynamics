import classes from "./SimulationCard.module.css";

import { useEffect } from "react";
import { Badge, Button, Card, Divider, Skeleton, Text } from "@mantine/core";
import { IconCircleOff, IconListDetails } from "@tabler/icons-react";
import { clsx } from "clsx";
import { useQueryState } from "nuqs";

import { nuqsKeys } from "@/lib/constants";
import { dateFormat } from "@/lib/utils";

interface Props {
  simulation: Simulation | null;
  isLoading?: boolean;
  type: "apo" | "acpype";
}

export function SimulationCard({ isLoading, simulation, type }: Props) {
  const [expanded, setExpanded] = useQueryState(
    nuqsKeys.SIMULATION_EXPANDED_DETAILS,
  );
  const [, setTab] = useQueryState(
    nuqsKeys.SIMULATION_EXPANDED_DETAILS_ACTIVE_TAB,
  );

  useEffect(() => {
    if (expanded) {
      setTab("3d-viewer");
    } else {
      setTab(null);
    }
  }, [expanded, setTab]);

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
            <Skeleton height={20} radius="xl" width={88.59} />
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
      <Card className={classes.container} withBorder>
        <div className={classes.headingContainer}>
          <div className={classes.headingSubContainer}>
            <Text className={classes.headingTitle}>{title[type]}</Text>
          </div>
          {subtitle[type] ? (
            <Text className={classes.headingSubtitle}>{subtitle[type]}</Text>
          ) : null}
        </div>
        <Divider />
        <div className={clsx(classes.contentContainer, classes.emptyContainer)}>
          <IconCircleOff size={48} />
          <Text fw={600} size="lg">
            No Simulation
          </Text>
        </div>
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
        <Text>
          <strong>Type</strong>: {simulation.type.toUpperCase()}
        </Text>
        <Text>
          <strong>Macromolecule</strong>: {simulation.moleculeName}
        </Text>
        {simulation.ligandPDBName ? (
          <Text>
            <strong>Ligand</strong>: {simulation.ligandPDBName}
          </Text>
        ) : null}
        <Text>
          <strong>Submitted At</strong>: {dateFormat(simulation.createdAt)}
        </Text>
        <Text>
          <strong>Started At</strong>:{" "}
          {simulation.startedAt
            ? dateFormat(simulation.startedAt)
            : "Not Started Yet"}
        </Text>
        <Text>
          <strong>Ended At</strong>:{" "}
          {simulation.endedAt
            ? dateFormat(simulation.endedAt)
            : "Not Ended Yet"}
        </Text>
      </div>
      <Divider />
      <Button
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
