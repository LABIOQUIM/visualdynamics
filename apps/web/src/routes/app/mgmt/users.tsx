import classes from "./users.module.css";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  MantineReactTable,
  type MRT_PaginationState,
  useMantineReactTable,
} from "mantine-react-table-open";
import { useState } from "preact/hooks";

import { TableRoleCell } from "./-components/TableRoleCell";

import { Heading } from "@/components/Heading";
import { PageLayout } from "@/components/PageLayout";
import { TableBooleanCell } from "@/components/TableBooleanCell";
import { TableDateCell } from "@/components/TableDateCell";
import { TableTextCell } from "@/components/TableTextCell";
import { getMgmtUsers } from "@/queries/getMgmtUsers";

export const Route = createFileRoute("/app/mgmt/users")({
  component: RouteComponent,
});

function RouteComponent() {
  const [pagination, onPaginationChange] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data, isLoading } = useQuery(getMgmtUsers());

  console.log(data);

  const table = useMantineReactTable({
    data: data?.users || [],
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
        // Cell: ActionsCell,
        enableColumnActions: false,
        maxSize: 48,
      },
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
    <PageLayout>
      <Heading title="Users" />
      <MantineReactTable table={table} />
    </PageLayout>
  );
}
