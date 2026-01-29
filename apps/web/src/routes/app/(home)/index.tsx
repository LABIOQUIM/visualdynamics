import classes from "./index.module.css";

import { ActionIcon } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import type { Duration } from "dayjs/plugin/duration";
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
import { getUserSimulations } from "@/queries/getUserSimulations";

export const Route = createFileRoute("/app/(home)/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [pagination, onPaginationChange] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data, isLoading } = useQuery(getUserSimulations(pagination));

  function DateCell({ cell }: { cell: MRT_Cell<Simulation> }) {
    const originalValue = cell.getValue<string | undefined>();

    if (!originalValue) {
      return "—";
    }

    const date = dayjs(originalValue);

    return date.format("YYYY-MM-DD HH:mm:ss");
  }

  function DurationAggregationFn(row: Simulation) {
    if (row.startedAt && row.endedAt) {
      const start = dayjs(row.startedAt);
      const end = dayjs(row.endedAt);
      const duration = dayjs.duration(end.diff(start));
      return duration;
    }

    return "—";
  }

  function DurationCell({ cell }: { cell: MRT_Cell<Simulation> }) {
    const duration = cell.getValue<Duration | string>();

    if (typeof duration === "string") {
      return duration;
    }

    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  function StatusCell({ cell }: { cell: MRT_Cell<Simulation> }) {
    const status = cell.getValue<Simulation["status"]>();

    return <StatusBadge status={status} />;
  }

  function ActionsCell({ cell }: { cell: MRT_Cell<Simulation> }) {
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
    onPaginationChange,
    paginationDisplayMode: "pages",
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
      },
      {
        accessorKey: "type",
        header: "Type",
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
        Cell: DurationCell,
      },
      {
        accessorKey: "startedAt",
        header: "Started At",
        Cell: DateCell,
      },
      {
        accessorKey: "endedAt",
        header: "Ended At",
        Cell: DateCell,
      },
      {
        accessorKey: "createdAt",
        header: "Submitted",
        Cell: DateCell,
      },
    ],
  });

  return (
    <PageLayout>
      <Heading title="My Simulations" />
      <MantineReactTable table={table} />
    </PageLayout>
  );
}
