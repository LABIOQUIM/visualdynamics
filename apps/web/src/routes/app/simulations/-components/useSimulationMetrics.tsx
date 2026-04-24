import { useMemo } from "react";
import dayjs from "dayjs";

import type { Icon } from "@tabler/icons-react";
import {
  IconAtom,
  IconAtom2,
  IconAtom2Filled,
  IconClockPlay,
  IconClockStop,
  IconCloudUpload,
  IconHourglassHigh,
  IconStatusChange,
} from "@tabler/icons-react";

import { StatusBadge } from "@/components/StatusBadge";
import { TypeBadge } from "@/components/TypeBadge";

export type MetricRow = {
  label: string;
  value: React.ReactNode;
  icon: Icon;
  label1: string;
  value1: React.ReactNode;
  icon1: Icon;
  label2: string;
  value2: React.ReactNode;
  icon2: Icon;
};

export function useSimulationMetrics(
  data: SimulationDetails | undefined,
): MetricRow[] {
  return useMemo(() => {
    if (!data) return [];

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

    const startedAtText = data.simulation.startedAt
      ? dayjs(data.simulation.startedAt).format("YYYY-MM-DD HH:mm:ss")
      : "—";

    const endedAtText = data.simulation.endedAt
      ? dayjs(data.simulation.endedAt).format("YYYY-MM-DD HH:mm:ss")
      : "—";

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
}
