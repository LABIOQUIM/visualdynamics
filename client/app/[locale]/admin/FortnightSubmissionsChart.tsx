"use client";
import dayjs from "dayjs";
import {
  Area,
  AreaChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import colors from "tailwindcss/colors";

import { H2 } from "@/components/Typography";
import { useCurrentLocale, useI18n } from "@/locales/client";
import { dateFormat } from "@/utils/dateFormat";

interface Props {
  data: {
    date: string;
    submissions: number;
    completed: number;
    errored: number;
    canceled: number;
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  const t = useI18n();
  const currentLocale = useCurrentLocale();

  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-black/60 p-4 dark:bg-neutral-600/60">
        <H2 className="text-white">
          {dateFormat(dayjs(label).toDate(), currentLocale, true)}
        </H2>
        {payload.map((element: any) => (
          <div
            className="flex gap-2"
            key={element.dataKey}
            style={{
              color: element.fill
            }}
          >
            <p className="font-bold">
              {/* @ts-ignore */}
              {t(`admin.dashboard.statuses.${element.dataKey}`)}:
            </p>
            <p>{element.payload[element.dataKey]}</p>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export function FortnightSubmissionsChart({ data }: Props) {
  const t = useI18n();
  const currentLocale = useCurrentLocale();

  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
    >
      <AreaChart
        width={500}
        height={400}
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0
        }}
      >
        <Legend
          // @ts-ignore
          formatter={(value) => t(`admin.dashboard.statuses.${value}`)}
          verticalAlign="top"
          height={36}
        />
        <XAxis
          dataKey="date"
          tickFormatter={(value) =>
            dateFormat(dayjs(value).toDate(), currentLocale, true, true)
          }
        />
        <YAxis allowDecimals={false} />
        <Tooltip content={CustomTooltip} />
        <Area
          type="monotone"
          dataKey="completed"
          stackId="1"
          stroke={colors.emerald[400]}
          fill={colors.emerald[400]}
        />
        <Area
          type="monotone"
          dataKey="canceled"
          stackId="2"
          stroke={colors.gray[400]}
          fill={colors.gray[400]}
        />
        <Area
          type="monotone"
          dataKey="errored"
          stackId="3"
          stroke={colors.red[400]}
          fill={colors.red[400]}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
