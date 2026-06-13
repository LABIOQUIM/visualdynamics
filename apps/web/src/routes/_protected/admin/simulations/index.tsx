import classes from "../-components/adminTable.module.css";

import { useState } from "react";
import { type ReactNode } from "react";
import { ActionIcon, Group, Text, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconAtom,
  IconClock,
  IconDots,
  IconEdit,
  IconEye,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconSend,
  IconStatusChange,
  IconTag,
  IconUser,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  MantineReactTable,
  type MRT_Cell,
  type MRT_PaginationState,
  MRT_TablePagination,
  useMantineReactTable,
} from "mantine-react-table-open";

import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { TableDateCell } from "@/components/TableDateCell";
import { TableDurationCell } from "@/components/TableDurationCell";
import { TableTextCell } from "@/components/TableTextCell";
import { TypeBadge } from "@/components/TypeBadge";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { retrySimulation } from "@/mutations/retrySimulation";
import { getMgmtSimulations } from "@/queries/getMgmtSimulations";

export const Route = createFileRoute("/_protected/admin/simulations/")({
  component: RouteComponent,
});

function HeaderIcon({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <Tooltip label={label}>
      <span aria-label={label} className={classes.headerIcon}>
        {children}
      </span>
    </Tooltip>
  );
}

function getPaginationRange(
  total: number,
  pageSize: number,
  pageIndex: number,
) {
  if (total === 0) return "0-0 of 0";
  const from = pageIndex * pageSize + 1;
  const to = Math.min(from + pageSize - 1, total);
  return `${from}-${to} of ${total}`;
}

function durationAccessorFn(row: SimulationWithUser) {
  if (row.startedAt && row.endedAt) {
    const start = dayjs(row.startedAt);
    const end = dayjs(row.endedAt);
    return dayjs.duration(end.diff(start));
  }
  return "—";
}

function StatusCell({ cell }: { cell: MRT_Cell<SimulationWithUser> }) {
  const status = cell.getValue<Simulation["status"]>();
  return <StatusBadge status={status} />;
}

function RouteComponent() {
  const queryClient = useQueryClient();
  const [pagination, onPaginationChange] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data, isLoading } = useQuery(getMgmtSimulations(pagination));

  const { mutate: retry, isPending: isRetrying } = useMutation({
    mutationFn: (simulationId: string) => retrySimulation(simulationId),
    onSuccess: ({ status }) => {
      notifications.show({
        title: "Simulation retried",
        message: `Simulation has been ${status}.`,
        color: "green",
        withBorder: true,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.mgmtSimulations(pagination),
      });
    },
    onError: () => {
      notifications.show({
        title: "Failed to retry",
        message: "Could not retry the simulation. Please try again.",
        color: "red",
        withBorder: true,
      });
    },
  });

  const table = useMantineReactTable({
    data: data?.records || [],
    enableColumnActions: false,
    enableGlobalFilter: true,
    enablePagination: true,
    enableRowActions: true,
    enableStickyHeader: true,
    enableTopToolbar: true,
    getRowId: (row) => row.id,
    initialState: {
      showGlobalFilter: true,
    },
    onPaginationChange,
    paginationDisplayMode: "pages",
    state: { isLoading, pagination },
    displayColumnDefOptions: {
      "mrt-row-actions": {
        Header: (
          <HeaderIcon label="Actions">
            <IconDots size={16} />
          </HeaderIcon>
        ),
        size: 96,
      },
    },
    rowCount: data?.total ?? 0,
    layoutMode: "grid",
    mantinePaginationProps: {
      showRowsPerPage: false,
      withEdges: true,
    },
    mantinePaperProps: {
      className: classes.paper,
    },
    mantineTableBodyCellProps: {
      className: classes.bodyCell,
    },
    mantineTableBodyRowProps: {
      className: classes.bodyRow,
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
    renderBottomToolbar: ({ table }) => (
      <Group
        className={classes.bottomToolbar}
        justify="space-between"
        wrap="nowrap"
      >
        <Text c="dimmed" size="sm">
          {getPaginationRange(
            data?.total ?? 0,
            pagination.pageSize,
            pagination.pageIndex,
          )}
        </Text>
        <MRT_TablePagination
          className={classes.pagination}
          position="bottom"
          table={table}
        />
      </Group>
    ),
    renderEmptyRowsFallback: () => (
      <Text c="dimmed" className={classes.emptyState} size="sm">
        No simulations found.
      </Text>
    ),
    renderRowActions: ({ row }) => {
      const canRetry =
        row.original.status === "ERRORED" ||
        row.original.status === "CANCELED";

      return (
        <ActionIcon.Group>
          <Link
            params={{ simulationId: row.original.id }}
            to="/simulations/$simulationId"
          >
            <ActionIcon size="lg" variant="subtle">
              <IconEye />
            </ActionIcon>
          </Link>
          <Link
            params={{ simulationId: row.original.id }}
            to="/admin/simulations/$simulationId"
          >
            <ActionIcon size="lg" variant="subtle">
              <IconEdit />
            </ActionIcon>
          </Link>
          {canRetry && (
            <ActionIcon
              loading={isRetrying}
              onClick={() => retry(row.original.id)}
              size="lg"
              variant="subtle"
            >
              <IconRefresh />
            </ActionIcon>
          )}
        </ActionIcon.Group>
      );
    },
    columns: [
      {
        accessorKey: "moleculeName",
        header: "Macromolecule",
        Header: (
          <HeaderIcon label="Macromolecule">
            <IconAtom size={16} />
          </HeaderIcon>
        ),
        size: 160,
        Cell: TableTextCell,
      },
      {
        accessorKey: "user.username",
        header: "Username",
        Header: (
          <HeaderIcon label="Username">
            <IconUser size={16} />
          </HeaderIcon>
        ),
        size: 140,
        Cell: TableTextCell,
      },
      {
        accessorKey: "type",
        header: "Type",
        Header: (
          <HeaderIcon label="Type">
            <IconTag size={16} />
          </HeaderIcon>
        ),
        mantineTableBodyCellProps: { align: "center" },
        size: 170,
        Cell: ({ cell }) => (
          <TypeBadge type={cell.getValue<SIMULATION_TYPE>()} />
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        Header: (
          <HeaderIcon label="Status">
            <IconStatusChange size={16} />
          </HeaderIcon>
        ),
        mantineTableBodyCellProps: { align: "center" },
        size: 120,
        Cell: StatusCell,
      },
      {
        id: "duration",
        header: "Duration",
        Header: (
          <HeaderIcon label="Duration">
            <IconClock size={16} />
          </HeaderIcon>
        ),
        size: 100,
        accessorFn: durationAccessorFn,
        Cell: TableDurationCell,
      },
      {
        accessorKey: "startedAt",
        header: "Started At",
        Header: (
          <HeaderIcon label="Started At">
            <IconPlayerPlay size={16} />
          </HeaderIcon>
        ),
        size: 160,
        Cell: TableDateCell,
      },
      {
        accessorKey: "endedAt",
        header: "Ended At",
        Header: (
          <HeaderIcon label="Ended At">
            <IconPlayerStop size={16} />
          </HeaderIcon>
        ),
        size: 160,
        Cell: TableDateCell,
      },
      {
        accessorKey: "createdAt",
        header: "Submitted",
        Header: (
          <HeaderIcon label="Submitted">
            <IconSend size={16} />
          </HeaderIcon>
        ),
        size: 160,
        Cell: TableDateCell,
      },
    ],
  });

  return (
    <PageLayout title="Simulations">
      <MantineReactTable table={table} />
    </PageLayout>
  );
}
