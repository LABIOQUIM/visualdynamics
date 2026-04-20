import type {
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_SortingState,
} from "mantine-react-table-open";

export const QUERY_KEYS = {
  simulation: (simulationId: string) => ["simulation", simulationId] as const,
  runningSimulation: (simulationId: string) =>
    ["running-simulation", simulationId] as const,
  userSimulations: (pageSize: number, pageIndex: number) =>
    ["user-simulations", pageSize, pageIndex] as const,
  mgmtSimulations: (pagination: MRT_PaginationState) =>
    ["mgmt-simulations", pagination] as const,
  mgmtUsers: (
    pagination?: MRT_PaginationState,
    columnFilters?: MRT_ColumnFiltersState,
    sorting?: MRT_SortingState,
  ) => ["mgmt-users", pagination, columnFilters, sorting] as const,
  mgmtUser: (userId: string) => ["mgmt-user", userId] as const,
  featureFlags: () => ["feature-flags"] as const,
} as const;
