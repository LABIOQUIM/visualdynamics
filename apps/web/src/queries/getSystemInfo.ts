import { queryOptions } from "@tanstack/react-query";

import { getAPIClient } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/queryKeys";

export const fetchSystemInfo = async () => {
  const api = await getAPIClient();
  return api.get<SystemInfo>("/systemInfo").then((response) => response.data);
};

export const getSystemInfo = () =>
  queryOptions({
    queryKey: QUERY_KEYS.systemInfo(),
    queryFn: fetchSystemInfo,
    refetchInterval: 10_000,
  });
