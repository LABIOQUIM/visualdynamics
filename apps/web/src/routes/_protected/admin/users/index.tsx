import classes from "../-components/adminTable.module.css";

import { useState } from "react";
import {
  Button,
  Group,
  Modal,
  Stack,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconKey, IconX } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Alert } from "@/components/Alert";
import { forcePasswordResetAll } from "@/mutations/forcePasswordResetAll";
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
  const [resetAllModalOpen, setResetAllModalOpen] = useState(false);
  const [resetAllLoading, setResetAllLoading] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    getMgmtUsers({ pagination, columnFilters, sorting }),
  );

  async function handleForcePasswordResetAll() {
    setResetAllLoading(true);
    try {
      const result = await forcePasswordResetAll();
      setResetAllModalOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["mgmt-users"] });
      notifications.show({
        message: `Password reset required for ${result.affected} non-admin users. All sessions revoked.`,
        color: "green",
        icon: <IconCheck />,
        withBorder: true,
      });
    } catch (err) {
      notifications.show({
        message:
          err instanceof Error
            ? err.message
            : "Failed to force password reset on all users",
        color: "red",
        icon: <IconX />,
        withBorder: true,
      });
    } finally {
      setResetAllLoading(false);
    }
  }

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
    <PageLayout
      rightElement={
        <Button
          color="violet"
          leftSection={<IconKey size={18} />}
          onClick={() => setResetAllModalOpen(true)}
          size="sm"
        >
          Force reset all
        </Button>
      }
      title="Users"
    >
      <Modal
        centered
        onClose={() => setResetAllModalOpen(false)}
        opened={resetAllModalOpen}
        title="Force password reset on all users?"
      >
        <Stack>
          <Alert
            status={{
              status: "warning",
              title: "This action cannot be undone",
              message:
                "All non-admin users will be required to reset their password on next sign-in. All active sessions will be revoked immediately. Admins are not affected.",
            }}
          />
          <Group justify="flex-end">
            <Button
              color="gray"
              onClick={() => setResetAllModalOpen(false)}
              variant="subtle"
            >
              Cancel
            </Button>
            <Button
              color="red"
              loading={resetAllLoading}
              onClick={() => void handleForcePasswordResetAll()}
            >
              Reset all passwords
            </Button>
          </Group>
        </Stack>
      </Modal>
      <MantineReactTable table={table} />
    </PageLayout>
  );
}
