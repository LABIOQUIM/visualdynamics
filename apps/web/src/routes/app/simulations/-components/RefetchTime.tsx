import { useMemo } from "react";
import { Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import dayjs from "dayjs";

import { useCountdown } from "@/hooks/useCountdown";
import { getSimulation } from "@/queries/getSimulation";

export function RefetchTime() {
  const { simulationId } = useParams({
    from: "/app/simulations/$simulationId",
  });
  const { data, dataUpdatedAt, isError } = useQuery(
    getSimulation(simulationId),
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

  const isDone = data.stepData.some((e) => e === "#analyzemd");

  if (!data.isActive && data.queuePosition === -1) {
    if (isDone) {
      return <Text>Simulation complete</Text>;
    }
    return <Text>Simulation stopped</Text>;
  }

  if (!data.isActive && data.queuePosition === -1) {
    return (
      <Text>
        Your simulation might be starting. We&apos;ll check again in{" "}
        {secsToRefetch} second(s)
      </Text>
    );
  }

  if (!data.isActive && data.queuePosition !== -1) {
    return <Text>We&apos;ll check again in {secsToRefetch} second(s)</Text>;
  }

  return <Text>{secsToRefetch} second(s) to refetch</Text>;
}
