"use client";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import colors from "tailwindcss/colors";

import { useI18n } from "@/locales/client";

interface Props {
  data: {
    _count: number;
    status: string;
  }[];
}

const COLORS = {
  COMPLETED: colors.emerald[400],
  QUEUED: colors.amber[400],
  CANCELED: colors.gray[400],
  ERRORED: colors.red[400],
  RUNNING: colors.indigo[400]
} as const;

export function SubmissionsByStatusChart({ data }: Props) {
  const t = useI18n();

  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
    >
      <PieChart
        width={400}
        height={400}
      >
        <Pie
          dataKey="_count"
          nameKey="status"
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              // @ts-ignore
              fill={COLORS[entry.status]}
            />
          ))}
        </Pie>
        <Legend
          formatter={(value) =>
            // @ts-ignore
            t(`admin.dashboard.statuses.${value.toLowerCase()}`)
          }
        />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
