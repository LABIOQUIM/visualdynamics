import { useMemo } from "react";
import { Text } from "@mantine/core";
import dayjs from "dayjs";

import { useRunningSimulation } from "@/hooks/simulation/useRunningSimulation";
import { useCountdown } from "@/hooks/useCountdown";

export function RefetchTime() {
  const { data, dataUpdatedAt, isError } = useRunningSimulation();

  const nextRefetchAt = useMemo(() => {
    if (!dataUpdatedAt) return null;
    return dayjs(dataUpdatedAt).add(10, "seconds");
  }, [dataUpdatedAt]);

  const secsToRefetch = useCountdown(nextRefetchAt);

  if (isError) {
    return <Text>Retrying in {secsToRefetch} second(s)</Text>;
  }

  if (!data || data === "unauthenticated") {
    return null;
  }

  if (data === "not-running") {
    return (
      <Text>
        Your simulation might be starting. We&apos;ll check again in{" "}
        {secsToRefetch} second(s)
      </Text>
    );
  }

  if (data === "queued") {
    return <Text>We&apos;ll check again in {secsToRefetch} second(s)</Text>;
  }

  return <Text>{secsToRefetch} second(s) to refetch</Text>;
}
