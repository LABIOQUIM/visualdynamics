import classes from "./-components/adminTable.module.css";

import { useState } from "react";
import { Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { UserWithRole } from "better-auth/plugins";
import {
  MantineReactTable,
  type MRT_ColumnFiltersState,
  MRT_EditActionButtons,
  type MRT_PaginationState,
  type MRT_SortingState,
  type MRT_TableOptions,
  useMantineReactTable,
} from "mantine-react-table-open";

import { TableRoleCell } from "./-components/TableRoleCell";

import { Heading } from "@/components/Heading";
import { PageLayout } from "@/components/PageLayout";
import { TableBooleanCell } from "@/components/TableBooleanCell";
import { TableDateCell } from "@/components/TableDateCell";
import { TableTextCell } from "@/components/TableTextCell";
import { authClient } from "@/lib/auth-client";
import { getMgmtUsers } from "@/queries/getMgmtUsers";

export const Route = createFileRoute("/app/mgmt/users")({
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

  const onEditingRowSave: MRT_TableOptions<UserWithRole>["onEditingRowSave"] =
    async ({ values, table, row }) => {
      // TODO: Should validate user input before updating user
      const { error } = await authClient.admin.updateUser({
        userId: row.id,
        data: values,
      });

      if (error) {
        notifications.show({
          message: error?.message,
          color: "red",
          icon: <IconX />,
          withBorder: true,
        });
      } else {
        notifications.show({
          message: "User updated successfully",
          color: "green",
          icon: <IconCheck />,
          withBorder: true,
        });
      }

      table.setEditingRow(null);
    };

  const table = useMantineReactTable({
    data: data?.users || [],
    enablePagination: true,
    enableTopToolbar: false,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    enableStickyHeader: true,
    editDisplayMode: "modal",
    enableEditing: true,
    onEditingRowSave,
    getRowId: (row) => row.id,
    onPaginationChange,
    onColumnFiltersChange,
    onSortingChange,
    paginationDisplayMode: "default",
    state: { columnFilters, isLoading, pagination, sorting },
    rowCount: data?.total ?? 0,
    layoutMode: "grid",
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Edit User</Title>
        {internalEditComponents}
        <MRT_EditActionButtons row={row} table={table} variant="text" />
      </Stack>
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
        accessorKey: "name",
        header: "Name",
        Cell: TableTextCell,
      },
      {
        accessorKey: "username",
        header: "Username",
        enableEditing: false,
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
        editVariant: "select",
        mantineEditSelectProps: {
          data: [
            {
              value: "admin",
              label: "Admin",
            },
            {
              value: "user",
              label: "User",
            },
          ],
        },
        Cell: TableRoleCell,
      },
      {
        accessorKey: "emailVerified",
        header: "Email Verified",
        Edit: () => null,
        Cell: TableBooleanCell,
      },
      {
        accessorKey: "twoFactorEnabled",
        header: "2-Factor Enabled",
        Edit: () => null,
        Cell: TableBooleanCell,
      },
      {
        accessorKey: "banned",
        header: "Banned",
        Edit: () => null,
        Cell: TableBooleanCell,
      },
      {
        accessorKey: "banReason",
        header: "Ban Reason",
        Edit: () => null,
        Cell: TableTextCell,
      },
      {
        accessorKey: "banExpires",
        header: "Ban Expires",
        Edit: () => null,
        Cell: TableDateCell,
      },
      {
        accessorKey: "updatedAt",
        header: "Updated At",
        Edit: () => null,
        enableEditing: false,
        Cell: TableDateCell,
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        Edit: () => null,
        enableEditing: false,
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
