import { queryOptions } from "@tanstack/react-query";
import type { MRT_PaginationState } from "mantine-react-table-open";

import { getAPIClient } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/queryKeys";

export type UserSimulations = {
  records: SimulationWithUser[];
  total: number;
};

export const fetchMgmtSimulations = async (pageSize: number, page: number) => {
  const api = await getAPIClient();

  return api
    .get<UserSimulations>("/simulation/management", {
      params: {
        pageSize,
        page,
      },
    })
    .then((r) => r.data);
};

export const getMgmtSimulations = (
  props: MRT_PaginationState = { pageIndex: 1, pageSize: 10 },
) =>
  queryOptions({
    queryKey: QUERY_KEYS.mgmtSimulations(props),
    queryFn: () => fetchMgmtSimulations(props.pageSize, props.pageIndex),
  });
