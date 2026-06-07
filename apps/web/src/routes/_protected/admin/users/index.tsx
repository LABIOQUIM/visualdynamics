import classes from "../-components/adminTable.module.css";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  MantineReactTable,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
  useMantineReactTable,
} from "mantine-react-table-open";

import { TableRoleCell } from "../-components/TableRoleCell";
import { UserRowActions } from "./-components/UserRowActions";

import { PageLayout } from "@/components/PageLayout";
import { TableBooleanCell } from "@/components/TableBooleanCell";
import { TableDateCell } from "@/components/TableDateCell";
import { TableTextCell } from "@/components/TableTextCell";
import { getMgmtUsers } from "@/queries/getMgmtUsers";

export const Route = createFileRoute("/_protected/admin/users/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [pagination, onPaginationChange] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, onColumnFiltersChange] =
    useState<MRT_ColumnFiltersState>([]);
  const [sorting, onSortingChange] = useState<MRT_SortingState>([]);

  const { data, isLoading } = useQuery(
    getMgmtUsers({ pagination, columnFilters, sorting }),
  );

  const table = useMantineReactTable({
    data: data?.users || [],
    enablePagination: true,
    enableTopToolbar: false,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    enableStickyHeader: true,
    getRowId: (row) => row.id,
    onPaginationChange,
    onColumnFiltersChange,
    onSortingChange,
    paginationDisplayMode: "default",
    state: { columnFilters, isLoading, pagination, sorting },
    rowCount: data?.total ?? 0,
    layoutMode: "grid",
    enableRowActions: true,
    displayColumnDefOptions: {
      "mrt-row-actions": {
        header: "Actions",
        size: 160,
      },
    },
    renderRowActions: ({ row }) => <UserRowActions row={row} />,
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
        accessorKey: "name",
        header: "Name",
        Cell: TableTextCell,
      },
      {
        accessorKey: "username",
        header: "Username",
        Cell: TableTextCell,
      },
      {
        accessorKey: "email",
        header: "Email",
        Cell: TableTextCell,
      },
      {
        accessorKey: "role",
        header: "Role",
        Cell: TableRoleCell,
      },
      {
        accessorKey: "emailVerified",
        header: "Email Verified",
        Cell: TableBooleanCell,
      },
      {
        accessorKey: "twoFactorEnabled",
        header: "2-Factor Enabled",
        Cell: TableBooleanCell,
      },
      {
        accessorKey: "banned",
        header: "Banned",
        Cell: TableBooleanCell,
      },
      {
        accessorKey: "banReason",
        header: "Ban Reason",
        Cell: TableTextCell,
      },
      {
        accessorKey: "banExpires",
        header: "Ban Expires",
        Cell: TableDateCell,
      },
      {
        accessorKey: "updatedAt",
        header: "Updated At",
        Cell: TableDateCell,
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        Cell: TableDateCell,
      },
    ],
  });

  return (
    <PageLayout title="Users">
      <MantineReactTable table={table} />
    </PageLayout>
  );
}
