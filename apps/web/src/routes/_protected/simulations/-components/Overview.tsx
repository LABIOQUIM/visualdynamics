import classes from "./Overview.module.css";

import {
  Alert,
  Box,
  Group,
  SimpleGrid,
  Text,
} from "@mantine/core";
import {
  IconClockOff,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

import { Loader } from "@/components/Loader";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { getSimulation } from "@/queries/getSimulation";

import { useSimulationMetrics } from "./useSimulationMetrics";

type OverviewProps = {
  simulationId: string;
};

export function Overview({ simulationId }: OverviewProps) {
  const { data } = useQuery(getSimulation(simulationId));

  const info = useSimulationMetrics(data);

  if (!data) {
    return <Loader />;
  }

  return (
    <>
      <Box className={classes.infoContainer}>
        {info.map(
          ({
            label,
            value,
            icon: Icon,
            label1,
            value1,
            icon1: Icon1,
            label2,
            value2,
            icon2: Icon2,
          }) => (
            <MetricCard.Root key={label}>
              <SimpleGrid cols={1}>
                <Group>
                  <MetricCard.Icon>
                    <Icon size="2rem" />
                  </MetricCard.Icon>
                  <div>
                    <MetricCard.TextMuted>{label}</MetricCard.TextMuted>
                    {typeof value === "string" ? (
                      <MetricCard.TextEmphasis>{value}</MetricCard.TextEmphasis>
                    ) : (
                      value
                    )}
                  </div>
                </Group>
                <Group>
                  <MetricCard.Icon>
                    <Icon1 size="2rem" />
                  </MetricCard.Icon>
                  <div>
                    <MetricCard.TextMuted>{label1}</MetricCard.TextMuted>
                    <MetricCard.TextEmphasis>{value1}</MetricCard.TextEmphasis>
                  </div>
                </Group>
                <Group>
                  <MetricCard.Icon>
                    <Icon2 size="2rem" />
                  </MetricCard.Icon>
                  <div>
                    <MetricCard.TextMuted>{label2}</MetricCard.TextMuted>
                    <MetricCard.TextEmphasis>{value2}</MetricCard.TextEmphasis>
                  </div>
                </Group>
              </SimpleGrid>
            </MetricCard.Root>
          ),
        )}
      </Box>
      {data.simulation.storageDeletedAt ? (
        <Alert
          color="gray"
          icon={<IconClockOff size="1rem" />}
          title="Storage deleted"
        >
          Simulation files were deleted on{" "}
          {dayjs(data.simulation.storageDeletedAt).format("YYYY-MM-DD")}.
        </Alert>
      ) : data.simulation.storageExpiresAt ? (
        (() => {
          const expiresAt = dayjs(data.simulation.storageExpiresAt);
          const daysLeft = expiresAt.diff(dayjs(), "day");
          return (
            <Alert
              color={daysLeft <= 7 ? "orange" : "blue"}
              icon={<IconClockOff size="1rem" />}
              title="Storage expires"
            >
              {`Simulation files will be automatically deleted on ${expiresAt.format("YYYY-MM-DD")} (${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining).`}
            </Alert>
          );
        })()
      ) : null}
      {(() => {
        const status = data.simulation.status;
        const messages: Record<Simulation["status"], string> = {
          QUEUED: `Your simulation is in the queue (position: ${data.queuePosition})`,
          RUNNING: "Your simulation is currently running",
          COMPLETED: "Simulation completed successfully",
          ERRORED: "This simulation encountered an error during execution",
          CANCELED: "This simulation was canceled",
          GENERATED:
            "This simulation has been created but has not been queued for execution yet",
        };

        return (
          <Box className={classes.stateBlock}>
            <Group mb={status === "ERRORED" && data.simulation.errorCause ? "xs" : undefined}>
              <StatusBadge status={status} />
              <Text size="sm" fw={500}>
                {messages[status]}
              </Text>
            </Group>
            {(status === "QUEUED" || status === "RUNNING") && (
              <Text size="sm" c="dimmed">
                Check the Run tab for more detailed information
              </Text>
            )}
            {status === "COMPLETED" && (
              <Text size="sm" c="dimmed">
                Download your results on the Downloads tab
              </Text>
            )}
            {status === "ERRORED" && data.simulation.errorCause && (
              <Text size="sm" c="dimmed">
                {data.simulation.errorCause}
              </Text>
            )}
          </Box>
        );
      })()}
    </>
  );
}
