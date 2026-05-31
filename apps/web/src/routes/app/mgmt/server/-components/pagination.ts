import type { Dispatch, SetStateAction } from "react";
import type { MRT_PaginationState } from "mantine-react-table-open";

export const QUEUE_TABLE_PAGE_SIZE = 5;

export type PaginationSetter = Dispatch<SetStateAction<MRT_PaginationState>>;

export function getInitialQueuePagination(): MRT_PaginationState {
  return {
    pageIndex: 0,
    pageSize: QUEUE_TABLE_PAGE_SIZE,
  };
}

export function setQueuePagination(
  setPagination: PaginationSetter,
  updater: SetStateAction<MRT_PaginationState>,
) {
  setPagination((current) => {
    const next = typeof updater === "function" ? updater(current) : updater;

    return {
      ...next,
      pageSize: QUEUE_TABLE_PAGE_SIZE,
    };
  });
}
