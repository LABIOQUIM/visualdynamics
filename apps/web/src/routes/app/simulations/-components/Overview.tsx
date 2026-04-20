import classes from "./Overview.module.css";

import {
  Alert,
  Blockquote,
  Box,
  Button,
  Group,
  SimpleGrid,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconAlertSquareRounded,
  IconBarrierBlockFilled,
  IconClockOff,
  IconX,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

import { Loader } from "@/components/Loader";
import { MetricCard } from "@/components/MetricCard";
import { cancelSimulation } from "@/mutations/cancelSimulation";
import { getSimulation } from "@/queries/getSimulation";
import { QUERY_KEYS } from "@/lib/queryKeys";

import { useSimulationMetrics } from "./useSimulationMetrics";

type OverviewProps = {
  simulationId: string;
};

export function Overview({ simulationId }: OverviewProps) {
  const queryClient = useQueryClient();
  const { data } = useQuery(getSimulation(simulationId));

  const { mutate: cancel, isPending: isCanceling } = useMutation({
    mutationFn: () => cancelSimulation(simulationId),
    onSuccess: () => {
      notifications.show({
        title: "Simulation canceled",
        message: "The simulation has been successfully canceled.",
        color: "orange",
        withBorder: true,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.simulation(simulationId),
      });
    },
    onError: () => {
      notifications.show({
        title: "Failed to cancel",
        message: "Could not cancel the simulation. Please try again.",
        color: "red",
        withBorder: true,
      });
    },
  });

  const canCancel =
    data?.simulation.status === "QUEUED" ||
    data?.simulation.status === "RUNNING";

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
      {data?.simulation.errorCause && (
        <Blockquote color="red" icon={<IconAlertSquareRounded />}>
          <strong>Error Cause:</strong> {data.simulation.errorCause}
        </Blockquote>
      )}
      {canCancel && (
        <Button
          color="red"
          leftSection={<IconX size="1rem" />}
          loading={isCanceling}
          onClick={() => cancel()}
          variant="light"
        >
          Cancel Simulation
        </Button>
      )}
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
      <MetricCard.Root className={classes.underDevelopmentCard}>
        <MetricCard.Icon>
          <IconBarrierBlockFilled size="4rem" />
        </MetricCard.Icon>
        <MetricCard.TextEmphasis>
          Under development: More detailed metrics and visualizations coming
          soon!
        </MetricCard.TextEmphasis>
      </MetricCard.Root>
    </>
  );
}
