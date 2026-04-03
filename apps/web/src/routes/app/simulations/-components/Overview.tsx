import classes from "./Overview.module.css";

import { useMemo } from "react";
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
  IconAtom,
  IconAtom2,
  IconAtom2Filled,
  IconBarrierBlockFilled,
  IconClockOff,
  IconClockPlay,
  IconClockStop,
  IconCloudUpload,
  IconHourglassHigh,
  IconStatusChange,
  IconX,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

import { Loader } from "@/components/Loader";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { TypeBadge } from "@/components/TypeBadge";
import { cancelSimulation } from "@/mutations/cancelSimulation";
import { getSimulation } from "@/queries/getSimulation";

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
        queryKey: ["simulation", simulationId],
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

  const info = useMemo(() => {
    if (!data) {
      return [];
    }

    let durationText = "—";

    if (data.simulation.startedAt && data.simulation.endedAt) {
      const start = dayjs(data.simulation.startedAt);
      const end = dayjs(data.simulation.endedAt);
      const duration = dayjs.duration(end.diff(start));

      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      const seconds = duration.seconds();

      durationText = `${hours}h ${minutes}m ${seconds}s`;
    }

    let startedAtText = "—";

    if (data.simulation.startedAt) {
      const start = dayjs(data.simulation.startedAt);

      startedAtText = start.format("YYYY-MM-DD HH:mm:ss");
    }

    let endedAtText = "—";

    if (data.simulation.endedAt) {
      const start = dayjs(data.simulation.endedAt);

      endedAtText = start.format("YYYY-MM-DD HH:mm:ss");
    }

    return [
      {
        label: "Status",
        value: <StatusBadge status={data.simulation.status} />,
        icon: IconStatusChange,
        label1: "Proccess",
        value1: <TypeBadge type={data.simulation.type} />,
        icon1: IconClockPlay,
        label2: "Submitted At",
        value2: dayjs(data.simulation.createdAt).format("YYYY-MM-DD HH:mm:ss"),
        icon2: IconCloudUpload,
      },
      {
        label: "Macromolecule",
        value: data.simulation.moleculeName,
        icon: IconAtom,
        label1: "Ligands (ITP)",
        value1:
          data.simulation.ligands.length > 0
            ? data.simulation.ligands.map((l) => l.ligandITPName).join(", ")
            : "N/A",
        icon1: IconAtom2,
        label2: "Ligands (PDB)",
        value2:
          data.simulation.ligands.length > 0
            ? data.simulation.ligands.map((l) => l.ligandPDBName).join(", ")
            : "N/A",
        icon2: IconAtom2Filled,
      },
      {
        label: "Duration",
        value: durationText,
        icon: IconHourglassHigh,
        label1: "Started At",
        value1: startedAtText,
        icon1: IconClockPlay,
        label2: "Ended At",
        value2: endedAtText,
        icon2: IconClockStop,
      },
    ];
  }, [data]);

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
