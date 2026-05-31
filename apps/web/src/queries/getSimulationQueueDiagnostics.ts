import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { getAPIClient } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/queryKeys";

export type SimulationQueueDiagnosticsPagination = {
  waitingPage: number;
  activePage: number;
  failedPage: number;
  queuedPage: number;
};

const defaultPagination: SimulationQueueDiagnosticsPagination = {
  waitingPage: 0,
  activePage: 0,
  failedPage: 0,
  queuedPage: 0,
};

export const fetchSimulationQueueDiagnostics = async (
  pagination: SimulationQueueDiagnosticsPagination = defaultPagination,
) => {
  const api = await getAPIClient();
  return api
    .get<SimulationQueueDiagnostics>("/simulation/admin/queue", {
      params: pagination,
    })
    .then((response) => response.data);
};

export const getSimulationQueueDiagnostics = (
  pagination: SimulationQueueDiagnosticsPagination = defaultPagination,
) =>
  queryOptions({
    queryKey: QUERY_KEYS.simulationQueueDiagnostics(
      pagination.waitingPage,
      pagination.activePage,
      pagination.failedPage,
      pagination.queuedPage,
    ),
    queryFn: () => fetchSimulationQueueDiagnostics(pagination),
    placeholderData: keepPreviousData,
    refetchInterval: 10_000,
  });
