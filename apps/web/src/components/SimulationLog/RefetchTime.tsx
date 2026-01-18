import { useMemo } from "react";
import { Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

import { useCountdown } from "@/hooks/useCountdown";
import { runningSimulationQuery } from "@/queries/runningSimulation";

interface Props {
  simulationId: string;
}

export function RefetchTime({ simulationId }: Props) {
  const { data, dataUpdatedAt, isError } = useQuery(
    runningSimulationQuery(simulationId),
  );

  const nextRefetchAt = useMemo(() => {
    if (!dataUpdatedAt) return null;
    return dayjs(dataUpdatedAt).add(10, "seconds");
  }, [dataUpdatedAt]);

  const secsToRefetch = useCountdown(nextRefetchAt);

  if (isError) {
    return <Text>Retrying in {secsToRefetch} second(s)</Text>;
  }

  if (!data) {
    return null;
  }

  if (data.status === "not-running") {
    return (
      <Text>
        Your simulation might be starting. We&apos;ll check again in{" "}
        {secsToRefetch} second(s)
      </Text>
    );
  }

  if (data.status === "queued") {
    return <Text>We&apos;ll check again in {secsToRefetch} second(s)</Text>;
  }

  return <Text>{secsToRefetch} second(s) to refetch</Text>;
}
