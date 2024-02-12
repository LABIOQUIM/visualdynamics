"use client";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import colors from "tailwindcss/colors";

import { H2 } from "@/components/Typography";

interface Props {
  data: {
    username: string;
    submissions: number;
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-black/60 p-4 dark:bg-neutral-600/60">
        <H2 className="text-white">{label}</H2>
        {payload.map((element: any) => (
          <div
            className="flex gap-2"
            key={element.dataKey}
            style={{
              color: element.fill
            }}
          >
            <p>{element.payload[element.dataKey]}</p>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export function AllTimeSubmissionsLeaderboardChart({ data }: Props) {
  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
    >
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5
        }}
        maxBarSize={36}
      >
        <XAxis dataKey="username" />
        <YAxis />

        <Tooltip content={CustomTooltip} />
        <Bar
          dataKey="submissions"
          fill={colors.emerald[600]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
