import { queryOptions } from "@tanstack/react-query";
import type {
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_SortingState,
} from "mantine-react-table-open";

import { authClient } from "@/lib/auth-client";
import { QUERY_KEYS } from "@/lib/queryKeys";

type Props = {
  pagination?: MRT_PaginationState | undefined;
  columnFilters?: MRT_ColumnFiltersState | undefined;
  sorting?: MRT_SortingState | undefined;
};

export const fetchMgmtUsers = async ({
  pagination,
  columnFilters,
  sorting,
}: Props) => {
  const { data, error } = await authClient.admin.listUsers({
    query: {
      limit: pagination ? pagination.pageSize : 999999,
      offset: pagination ? pagination.pageIndex * pagination.pageSize : 0,
      filterField:
        columnFilters && columnFilters.length > 0
          ? columnFilters[0].id
          : undefined,
      filterOperator:
        columnFilters && columnFilters.length > 0 ? "contains" : undefined,
      filterValue:
        columnFilters && columnFilters.length > 0
          ? (columnFilters[0].value as string)
          : undefined,
      sortBy: sorting && sorting.length > 0 ? sorting[0].id : undefined,
      sortDirection:
        sorting && sorting.length > 0
          ? sorting[0].desc
            ? "desc"
            : "asc"
          : undefined,
    },
  });

  if (error) {
    throw error;
  }

  return data;
};

export const getMgmtUsers = ({ pagination, columnFilters, sorting }: Props) =>
  queryOptions({
    queryKey: QUERY_KEYS.mgmtUsers(pagination, columnFilters, sorting),
    queryFn: () => fetchMgmtUsers({ pagination, columnFilters, sorting }),
  });
