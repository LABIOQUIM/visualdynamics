import classes from "./-components/adminTable.module.css";

import { useState } from "react";
import { ActionIcon } from "@mantine/core";
import { IconDotsVertical, IconEdit, IconEye } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  MantineReactTable,
  type MRT_Cell,
  type MRT_PaginationState,
  useMantineReactTable,
} from "mantine-react-table-open";

import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { TableDateCell } from "@/components/TableDateCell";
import { TableDurationCell } from "@/components/TableDurationCell";
import { TableTextCell } from "@/components/TableTextCell";
import { TypeBadge } from "@/components/TypeBadge";
import { getMgmtSimulations } from "@/queries/getMgmtSimulations";

export const Route = createFileRoute("/_protected/admin/simulations")({
  component: RouteComponent,
  staticData: {
    breadcrumb: "Simulations",
  },
});

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
  const [pagination, onPaginationChange] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data, isLoading } = useQuery(getMgmtSimulations(pagination));

  const table = useMantineReactTable({
    data: data?.records || [],
    enablePagination: true,
    enableTopToolbar: false,
    manualPagination: true,
    enableStickyHeader: true,
    getRowId: (row) => row.id,
    enableEditing: true,
    onPaginationChange,
    state: { isLoading, pagination },
    displayColumnDefOptions: {
      "mrt-row-actions": {
        size: 120, //make actions column wider
      },
    },
    rowCount: data?.total ?? 0,
    layoutMode: "grid",
    renderRowActions: ({ row, table }) => (
      <ActionIcon.Group>
        <Link
          params={{ simulationId: row.original.id }}
          to="/simulations/$simulationId"
        >
          <ActionIcon size="lg" variant="subtle">
            <IconEye />
          </ActionIcon>
        </Link>
        <ActionIcon
          onClick={() => table.setEditingRow(row)}
          size="lg"
          variant="subtle"
        >
          <IconEdit />
        </ActionIcon>
        <ActionIcon
          onClick={() => table.setEditingRow(row)}
          size="lg"
          variant="subtle"
        >
          <IconDotsVertical />
        </ActionIcon>
      </ActionIcon.Group>
    ),
    mantinePaginationProps: {
      showRowsPerPage: false,
    },
    mantinePaperProps: {
      className: classes.paper,
    },
    mantineTableContainerProps: {
      className: classes.tableContainer,
    },
    mantineTableProps: {
      highlightOnHover: true,
    },
    mantineTableHeadProps: {
      className: classes.tableHead,
    },
    mantineTableHeadCellProps: {
      className: classes.tableHeadCell,
    },
    columns: [
      {
        accessorKey: "moleculeName",
        header: "Macromolecule",
        enableEditing: false,
        Cell: TableTextCell,
      },
      {
        accessorKey: "user.username",
        header: "Username",
        enableEditing: false,
        Cell: TableTextCell,
      },
      {
        accessorKey: "type",
        header: "Type",
        enableEditing: false,
        Cell: ({ cell }) => (
          <TypeBadge type={cell.getValue<SIMULATION_TYPE>()} />
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        editVariant: "select",
        mantineEditSelectProps: {
          data: ["RUNNING", "COMPLETED", "ERRORED", "CANCELED", "GENERATED"],
        },
        Cell: StatusCell,
      },
      {
        id: "duration",
        header: "Duration",
        Edit: () => null,
        accessorFn: durationAccessorFn,
        Cell: TableDurationCell,
      },
      {
        accessorKey: "startedAt",
        header: "Started At",
        Edit: () => null,
        Cell: TableDateCell,
      },
      {
        accessorKey: "endedAt",
        header: "Ended At",
        Edit: () => null,
        Cell: TableDateCell,
      },
      {
        accessorKey: "createdAt",
        header: "Submitted",
        Edit: () => null,
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
