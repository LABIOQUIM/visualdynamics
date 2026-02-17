import { queryOptions } from "@tanstack/react-query";
import type { MRT_PaginationState } from "mantine-react-table-open";

import { authClient } from "@/lib/auth-client";

export const fetchMgmtUsers = async (
  props: MRT_PaginationState = { pageIndex: 1, pageSize: 10 },
) => {
  const { data, error } = await authClient.admin.listUsers({
    query: {
      limit: props.pageSize,
      offset: props.pageIndex * props.pageSize,
    },
  });

  if (error) {
    throw error;
  }

  return data;
};

export const getMgmtUsers = (
  props: MRT_PaginationState = { pageIndex: 1, pageSize: 10 },
) =>
  queryOptions({
    queryKey: ["mgmt-users", props],
    queryFn: () => fetchMgmtUsers(props),
  });
