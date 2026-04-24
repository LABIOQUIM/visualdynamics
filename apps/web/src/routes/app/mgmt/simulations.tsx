import classes from "./-components/adminTable.module.css";

import { useState } from "react";
import { ActionIcon, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconX,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  MantineReactTable,
  type MRT_Cell,
  MRT_EditActionButtons,
  type MRT_PaginationState,
  type MRT_TableOptions,
  useMantineReactTable,
} from "mantine-react-table-open";

import { Heading } from "@/components/Heading";
import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { TableDateCell } from "@/components/TableDateCell";
import { TableDurationCell } from "@/components/TableDurationCell";
import { TableTextCell } from "@/components/TableTextCell";
import { TypeBadge } from "@/components/TypeBadge";
import { getAPIClient } from "@/lib/api";
import { getMgmtSimulations } from "@/queries/getMgmtSimulations";

export const Route = createFileRoute("/app/mgmt/simulations")({
  component: RouteComponent,
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

  const onEditingRowSave: MRT_TableOptions<SimulationWithUser>["onEditingRowSave"] =
    async ({ values, table, row }) => {
      const api = await getAPIClient();

      try {
        await api.patch(`/simulation/update/${row.id}`, {
          status: values.status,
        });

        notifications.show({
          message: "Simulation updated successfully",
          color: "green",
          icon: <IconCheck />,
          withBorder: true,
        });
      } catch {
        notifications.show({
          message: "Failed to update simulation",
          color: "red",
          icon: <IconX />,
          withBorder: true,
        });
      }

      table.setEditingRow(null);
    };

  const table = useMantineReactTable({
    data: data?.records || [],
    enablePagination: true,
    enableTopToolbar: false,
    manualPagination: true,
    enableStickyHeader: true,
    getRowId: (row) => row.id,
    enableEditing: true,
    onPaginationChange,
    onEditingRowSave,
    state: { isLoading, pagination },
    displayColumnDefOptions: {
      "mrt-row-actions": {
        size: 120, //make actions column wider
      },
    },
    rowCount: data?.total ?? 0,
    layoutMode: "grid",
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Edit User</Title>
        {internalEditComponents}
        <MRT_EditActionButtons row={row} table={table} variant="text" />
      </Stack>
    ),
    renderRowActions: ({ row, table }) => (
      <ActionIcon.Group>
        <Link
          params={{ simulationId: row.original.id }}
          to="/app/simulations/$simulationId"
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
    <PageLayout>
      <Heading title="Simulations" />
      <MantineReactTable table={table} />
    </PageLayout>
  );
}
