"use client";
import { useMemo, useState } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { Prisma, SIMULATION_STATUS } from "database";
import {
  MantineReactTable,
  type MRT_ColumnDef as MRTColumnDef,
  type MRT_ColumnFiltersState as MRTColumnFiltersState,
  type MRT_PaginationState as MRTPaginationState,
  type MRT_SortingState as MRTSortingState,
  useMantineReactTable,
} from "mantine-react-table";

import { useSimulations } from "@/hooks/administration/useSimulations";
import { dateFormat } from "@/utils/dateFormat";

import { SimulationInfo } from "./SimulationInfo";

type SimulationWithUser = Prisma.SimulationGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        userName: true;
      };
    };
  };
}>;

export function SimulationManagerList() {
  const [columnFilters, setColumnFilters] = useState<MRTColumnFiltersState>([]);
  const [sorting, setSorting] = useState<MRTSortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [pagination, setPagination] = useState<MRTPaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isError, isFetching, isLoading, refetch } = useSimulations(
    columnFilters,
    sorting,
    pagination
  );

  const colors: { [key in SIMULATION_STATUS]: string } = useMemo(
    () => ({
      GENERATED: "inherit",
      COMPLETED: "green.3",
      QUEUED: "orange.3",
      ERRORED: "red.3",
      RUNNING: "blue.3",
      CANCELED: "grey",
    }),
    []
  );

  const columns = useMemo<MRTColumnDef<SimulationWithUser>[]>(
    () => [
      {
        acessorKey: "actions",
        Cell(props) {
          return (
            <SimulationInfo
              refetchAll={refetch}
              simulationId={props.row.original.id}
            />
          );
        },
        header: " ",
        enableHiding: false,
      },
      {
        accessorKey: "user.userName",
        header: "Username",
      },
      {
        accessorKey: "type",
        header: "Type",
      },
      {
        accessorKey: "moleculeName",
        header: "Macromolecule",
      },
      {
        accessorKey: "status",
        header: "Status",
        filterVariant: "select",
        mantineTableBodyCellProps(props) {
          return {
            c: colors[props.row.original.status],
          };
        },
        mantineFilterSelectProps: {
          data: [
            { label: "Completed", value: "COMPLETED" },
            { label: "Running", value: "RUNNING" },
            { label: "Errored", value: "ERRORED" },
            { label: "Queued", value: "QUEUED" },
            { label: "Generated", value: "GENERATED" },
          ],
        },
      },
      {
        accessorKey: "startedAt",
        accessorFn(originalRow) {
          return dateFormat(originalRow.startedAt);
        },
        header: "Started at",
        filterVariant: "date-range",
      },
      {
        accessorKey: "endedAt",
        accessorFn(originalRow) {
          return dateFormat(originalRow.endedAt);
        },
        header: "Ended at",
        filterVariant: "date-range",
      },
      {
        accessorKey: "createdAt",
        accessorFn(originalRow) {
          return dateFormat(originalRow.createdAt);
        },
        header: "Created at",
        filterVariant: "date-range",
      },
    ],
    [colors, refetch]
  );

  const table = useMantineReactTable({
    columns,
    layoutMode: "semantic",
    data: !data || typeof data === "string" ? [] : data[1],
    enableColumnFilterModes: false,
    columnFilterModeOptions: ["contains", "startsWith", "endsWith"],
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    mantineToolbarAlertBannerProps: isError
      ? {
          color: "red",
          children: "Error loading data",
        }
      : undefined,
    enableGlobalFilter: false,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    renderTopToolbarCustomActions: () => (
      <Tooltip label="Refresh Data">
        <ActionIcon onClick={() => refetch()}>
          <IconRefresh />
        </ActionIcon>
      </Tooltip>
    ),
    rowCount: !data || typeof data === "string" ? 0 : data[0],
    state: {
      columnFilters,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isFetching,
      sorting,
    },
    mantinePaperProps: {
      style: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        // height: "calc(100dvh - 64px - 35.09px - 53px)",
      },
    },
    mantineTableContainerProps: {
      style: {
        flex: 1,
      },
    },
  });

  return <MantineReactTable table={table} />;
}
