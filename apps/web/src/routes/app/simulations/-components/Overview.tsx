import classes from "./Overview.module.css";

import { Blockquote, Box, Group, SimpleGrid } from "@mantine/core";
import {
  IconAlertSquareRounded,
  IconAtom,
  IconAtom2,
  IconAtom2Filled,
  IconBarrierBlockFilled,
  IconClockPlay,
  IconClockStop,
  IconCloudUpload,
  IconHourglassHigh,
  IconStatusChange,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo } from "react";

import { Loader } from "@/components/Loader";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { getSimulation } from "@/queries/getSimulation";

type OverviewProps = {
  simulationId: string;
};

export function Overview({ simulationId }: OverviewProps) {
  const { data } = useQuery(getSimulation(simulationId));

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
        value1:
          data.simulation.type === "apo"
            ? "Free Protein"
            : "Protein-Ligand Complex",
        icon1: IconClockPlay,
        label2: "Submitted At",
        value2: dayjs(data.simulation.createdAt).format("YYYY-MM-DD HH:mm:ss"),
        icon2: IconCloudUpload,
      },
      {
        label: "Macromolecule",
        value: data.simulation.moleculeName,
        icon: IconAtom,
        label1: "Ligand ITP",
        value1: data.simulation.ligandITPName || "N/A",
        icon1: IconAtom2,
        label2: "Ligand PDB",
        value2: data.simulation.ligandPDBName || "N/A",
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
