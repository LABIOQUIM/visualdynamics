import { queryOptions } from "@tanstack/react-query";
import type { MRT_PaginationState } from "mantine-react-table-open";

import { getAPIClient } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/queryKeys";

export type UserSimulations = {
  records: Simulation[];
  total: number;
};

export const fetchUserSimulations = async (pageSize: number, page: number) => {
  const api = await getAPIClient();

  return api
    .get<UserSimulations>("/simulation/current-user", {
      params: {
        pageSize,
        page,
      },
    })
    .then((r) => r.data);
};

export const getUserSimulations = (
  props: MRT_PaginationState = { pageIndex: 1, pageSize: 10 },
) =>
  queryOptions({
    queryKey: QUERY_KEYS.userSimulations(props.pageSize, props.pageIndex),
    queryFn: () => fetchUserSimulations(props.pageSize, props.pageIndex),
  });
