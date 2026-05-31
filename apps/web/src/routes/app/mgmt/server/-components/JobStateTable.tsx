import { ActionIcon, Badge, Group, Text, Title, Tooltip } from "@mantine/core";
import {
  IconClockCheck,
  IconClockPlay,
  IconHash,
  IconRefresh,
  IconRepeat,
  IconUser,
} from "@tabler/icons-react";
import {
  MantineReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  MRT_TablePagination,
  useMantineReactTable,
} from "mantine-react-table-open";
import { type ReactNode, useEffect, useMemo } from "react";

import { formatDateTime } from "./formatters";
import { type PaginationSetter, QUEUE_TABLE_PAGE_SIZE } from "./pagination";

import classes from "./JobStateTable.module.css";

export type JobTableRecord = {
  attemptsMade: number | null;
  finishedAt: number | string | null | undefined;
  id: string | null | undefined;
  requeueSubmissionId: string | null;
  startedAt: number | string | null | undefined;
  username: string | null;
};

function getTotalPages(total: number) {
  return Math.max(1, Math.ceil(total / QUEUE_TABLE_PAGE_SIZE));
}

function getPaginationRange(total: number, pagination: MRT_PaginationState) {
  if (total === 0) return "0-0 of 0";

  const maxPageIndex = getTotalPages(total) - 1;
  const pageIndex = Math.min(pagination.pageIndex, maxPageIndex);
  const from = pageIndex * QUEUE_TABLE_PAGE_SIZE + 1;
  const to = Math.min(from + QUEUE_TABLE_PAGE_SIZE - 1, total);

  return `${from}-${to} of ${total}`;
}

function formatJobId(value: string | null | undefined) {
  if (!value) return "--";

  return /^\d+$/.test(value) ? value.padStart(3, "0") : value;
}

function formatAttempts(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "--";

  return String(value).padStart(2, "0");
}

function HeaderIcon({ children, label }: { children: ReactNode; label: string }) {
  return (
    <Tooltip label={label}>
      <span aria-label={label} className={classes.headerIcon}>
        {children}
      </span>
    </Tooltip>
  );
}

export function JobTable({
  data,
  emptyMessage,
  isFetching,
  isLoading,
  onRequeue,
  onPaginationChange,
  pagination,
  requeueingSubmissionId,
  title,
}: {
  data: PaginatedRecords<JobTableRecord>;
  emptyMessage: string;
  isFetching: boolean;
  isLoading: boolean;
  onRequeue: ((submissionId: string) => void) | undefined;
  onPaginationChange: PaginationSetter;
  pagination: MRT_PaginationState;
  requeueingSubmissionId: string | undefined;
  title: string;
}) {
  const maxPageIndex = getTotalPages(data.total) - 1;

  useEffect(() => {
    if (pagination.pageIndex <= maxPageIndex) return;

    onPaginationChange({
      pageIndex: maxPageIndex,
      pageSize: QUEUE_TABLE_PAGE_SIZE,
    });
  }, [maxPageIndex, onPaginationChange, pagination.pageIndex]);

  const columns = useMemo<MRT_ColumnDef<JobTableRecord>[]>(
    () => [
      {
        id: "action",
        header: "Actions",
        Header: (
          <HeaderIcon label="Actions">
            <IconRefresh size={16} />
          </HeaderIcon>
        ),
        size: 52,
        minSize: 52,
        maxSize: 52,
        Cell: ({ row }) =>
          row.original.requeueSubmissionId && onRequeue ? (
            <Tooltip label="Requeue">
              <ActionIcon
                aria-label="Requeue"
                loading={requeueingSubmissionId === row.original.requeueSubmissionId}
                onClick={() => onRequeue(row.original.requeueSubmissionId as string)}
                size="sm"
                variant="light"
              >
                <IconRefresh size={14} />
              </ActionIcon>
            </Tooltip>
          ) : (
            <Text c="dimmed" size="sm">
              --
            </Text>
          ),
      },
      {
        accessorKey: "id",
        header: "Job ID",
        Header: (
          <HeaderIcon label="Job ID">
            <IconHash size={16} />
          </HeaderIcon>
        ),
        size: 64,
        minSize: 64,
        maxSize: 64,
        Cell: ({ cell }) => formatJobId(cell.getValue<string | null | undefined>()),
      },
      {
        accessorKey: "username",
        header: "Username",
        Header: (
          <HeaderIcon label="Username">
            <IconUser size={16} />
          </HeaderIcon>
        ),
        size: 150,
        minSize: 150,
        maxSize: 150,
        Cell: ({ cell }) => cell.getValue<string | null>() ?? "--",
      },
      {
        accessorKey: "attemptsMade",
        header: "Attempts",
        Header: (
          <HeaderIcon label="Attempts">
            <IconRepeat size={16} />
          </HeaderIcon>
        ),
        size: 76,
        minSize: 76,
        maxSize: 76,
        Cell: ({ cell }) => formatAttempts(cell.getValue<number | null>()),
      },
      {
        accessorKey: "startedAt",
        header: "Started",
        Header: (
          <HeaderIcon label="Started">
            <IconClockPlay size={16} />
          </HeaderIcon>
        ),
        size: 140,
        minSize: 140,
        maxSize: 140,
        Cell: ({ cell }) => formatDateTime(cell.getValue<number | string | null | undefined>()),
      },
      {
        accessorKey: "finishedAt",
        header: "Finished",
        Header: (
          <HeaderIcon label="Finished">
            <IconClockCheck size={16} />
          </HeaderIcon>
        ),
        size: 140,
        minSize: 140,
        maxSize: 140,
        Cell: ({ cell }) => formatDateTime(cell.getValue<number | string | null | undefined>()),
      },
    ],
    [onRequeue, requeueingSubmissionId],
  );

  const table = useMantineReactTable({
    data: data.records,
    columns,
    enableColumnActions: false,
    enablePagination: true,
    enableSorting: false,
    enableStickyHeader: true,
    enableTopToolbar: true,
    layoutMode: "grid",
    manualPagination: true,
    mantinePaginationProps: {
      showRowsPerPage: false,
      withEdges: true,
    },
    mantinePaperProps: {
      className: classes.paper,
    },
    mantineTableBodyProps:
      data.records.length === 0
        ? {
            className: classes.emptyTableBody,
            style: {
              height: 40,
              maxHeight: 40,
              minHeight: 40,
            },
          }
        : {},
    mantineTableBodyCellProps: {
      className: classes.bodyCell,
    },
    mantineTableBodyRowProps: {
      className: classes.bodyRow,
      style: {
        height: 40,
        maxHeight: 40,
        minHeight: 40,
      },
    },
    mantineTableContainerProps: {
      className: classes.tableContainer,
    },
    mantineTableHeadCellProps: {
      className: classes.headCell,
    },
    mantineTableHeadRowProps: {
      className: classes.headRow,
    },
    mantineTableProps: {
      highlightOnHover: true,
    },
    onPaginationChange,
    paginationDisplayMode: "pages",
    renderBottomToolbar: ({ table }) => (
      <Group className={classes.bottomToolbar} justify="space-between" wrap="nowrap">
        <Text c="dimmed" size="sm">
          {getPaginationRange(data.total, pagination)}
        </Text>
        <MRT_TablePagination className={classes.pagination} position="bottom" table={table} />
      </Group>
    ),
    renderEmptyRowsFallback: () => (
      <Text c="dimmed" className={classes.emptyState} size="sm">
        {emptyMessage}
      </Text>
    ),
    renderTopToolbar: () => (
      <Group className={classes.topToolbar} justify="space-between" wrap="nowrap">
        <Title order={4}>{title}</Title>
        <Badge variant="light">{data.total}</Badge>
      </Group>
    ),
    rowCount: Math.max(data.total, 1),
    state: {
      isLoading,
      pagination,
      showProgressBars: isFetching,
    },
  });

  return <MantineReactTable table={table} />;
}

export function JobStateTable({
  isFetching,
  isLoading,
  jobs,
  onRequeue,
  onPaginationChange,
  pagination,
  requeueingSubmissionId,
  title,
}: {
  isFetching: boolean;
  isLoading: boolean;
  jobs: PaginatedRecords<SimulationQueueJobSummary>;
  onRequeue?: (submissionId: string) => void;
  onPaginationChange: PaginationSetter;
  pagination: MRT_PaginationState;
  requeueingSubmissionId?: string | undefined;
  title: string;
}) {
  const records = useMemo<PaginatedRecords<JobTableRecord>>(
    () => ({
      records: jobs.records.map((job) => ({
        attemptsMade: job.attemptsMade,
        finishedAt: job.finishedOn,
        id: job.id,
        requeueSubmissionId: job.simulationId,
        startedAt: job.processedOn,
        username: job.username,
      })),
      total: jobs.total,
    }),
    [jobs],
  );

  return (
    <JobTable
      data={records}
      emptyMessage="No jobs to show."
      isFetching={isFetching}
      isLoading={isLoading}
      onRequeue={onRequeue}
      onPaginationChange={onPaginationChange}
      pagination={pagination}
      requeueingSubmissionId={requeueingSubmissionId}
      title={title}
    />
  );
}
