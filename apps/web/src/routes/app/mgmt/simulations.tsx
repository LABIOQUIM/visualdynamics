import classes from "./simulations.module.css";

import { ActionIcon } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  MantineReactTable,
  type MRT_Cell,
  type MRT_PaginationState,
  useMantineReactTable,
} from "mantine-react-table-open";
import { useState } from "preact/hooks";

import { Heading } from "@/components/Heading";
import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { TableDateCell } from "@/components/TableDateCell";
import { TableDurationCell } from "@/components/TableDurationCell";
import { TableTextCell } from "@/components/TableTextCell";
import { getMgmtSimulations } from "@/queries/getMgmtSimulations";

export const Route = createFileRoute("/app/mgmt/simulations")({
  component: RouteComponent,
});

function RouteComponent() {
  const [pagination, onPaginationChange] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data, isLoading } = useQuery(getMgmtSimulations(pagination));

  function DurationAggregationFn(row: SimulationWithUser) {
    if (row.startedAt && row.endedAt) {
      const start = dayjs(row.startedAt);
      const end = dayjs(row.endedAt);
      const duration = dayjs.duration(end.diff(start));
      return duration;
    }

    return "—";
  }

  function StatusCell({ cell }: { cell: MRT_Cell<SimulationWithUser> }) {
    const status = cell.getValue<Simulation["status"]>();

    return <StatusBadge status={status} />;
  }

  function ActionsCell({ cell }: { cell: MRT_Cell<SimulationWithUser> }) {
    const simulationId = cell.row.original.id;

    return (
      <Link params={{ simulationId }} to="/app/simulations/$simulationId">
        <ActionIcon size="lg" variant="subtle">
          <IconEye />
        </ActionIcon>
      </Link>
    );
  }

  const table = useMantineReactTable({
    data: data?.records || [],
    enablePagination: true,
    enableTopToolbar: false,
    manualPagination: true,
    enableStickyHeader: true,
    getRowId: (row) => row.id,
    onPaginationChange,
    paginationDisplayMode: "default",
    state: { isLoading, pagination },
    rowCount: data?.total,
    layoutMode: "grid",
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
        header: "",
        id: "actions",
        Cell: ActionsCell,
        enableColumnActions: false,
        maxSize: 48,
      },
      {
        accessorKey: "moleculeName",
        header: "Macromolecule",
        Cell: TableTextCell,
      },
      {
        accessorKey: "user.username",
        header: "Username",
        Cell: TableTextCell,
      },
      {
        accessorKey: "type",
        header: "Type",
        Cell: TableTextCell,
      },
      {
        accessorKey: "status",
        header: "Status",
        Cell: StatusCell,
      },
      {
        id: "duration",
        header: "Duration",
        accessorFn: DurationAggregationFn,
        Cell: TableDurationCell,
      },
      {
        accessorKey: "startedAt",
        header: "Started At",
        Cell: TableDateCell,
      },
      {
        accessorKey: "endedAt",
        header: "Ended At",
        Cell: TableDateCell,
      },
      {
        accessorKey: "createdAt",
        header: "Submitted",
        Cell: TableDateCell,
      },
    ],
  });

  return (
    <PageLayout>
      <Heading title="Simulations" />
      <MantineReactTable table={table} />
    </PageLayout>
  );
}
