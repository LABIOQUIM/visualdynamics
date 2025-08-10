"use client";
import { useMemo, useState } from "react";
import { ActionIcon, Box, Tooltip } from "@mantine/core";
import { IconFolder, IconRefresh } from "@tabler/icons-react";
import { User } from "lucia";
import {
  MantineReactTable,
  type MRT_ColumnDef as MRTColumnDef,
  type MRT_ColumnFiltersState as MRTColumnFiltersState,
  type MRT_PaginationState as MRTPaginationState,
  type MRT_SortingState as MRTSortingState,
  useMantineReactTable,
} from "mantine-react-table";
import Link from "next/link";

import { useUsers } from "@/hooks/administration/useUsers";
import { dateFormat } from "@/utils/dateFormat";

import { BanUser } from "./BanUser";
import { ResendValidationEmail } from "./ResendValidationEmail";
import { UpdateUser } from "./UpdateUser";

import classes from "./UserList.module.css";

export function AdministrationUserList() {
  const [columnFilters, setColumnFilters] = useState<MRTColumnFiltersState>([]);
  const [sorting, setSorting] = useState<MRTSortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [pagination, setPagination] = useState<MRTPaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isFetching, isError, isLoading, refetch } = useUsers(
    columnFilters,
    sorting,
    pagination
  );

  const columns = useMemo<MRTColumnDef<User>[]>(
    () => [
      {
        accessorFn(originalRow) {
          let name = originalRow.firstName;

          if (originalRow.lastName) {
            name += ` ${originalRow.lastName}`;
          }

          return name;
        },
        enableSorting: false,
        enableColumnFilter: false,
        header: "Name",
      },
      {
        accessorKey: "userName",
        header: "Username",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "status",
        header: "Status",
        filterVariant: "select",
        mantineFilterSelectProps: {
          data: [
            { label: "Active", value: "ACTIVE" },
            {
              label: "Disabled by Administrator",
              value: "DISABLED_BY_ADMINISTRATOR",
            },
            {
              label: "Awaiting Email Validation",
              value: "AWAITING_EMAIL_VALIDATION",
            },
            { label: "Inactive", value: "INACTIVE" },
          ],
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        filterVariant: "select",
        mantineFilterSelectProps: {
          data: [
            { label: "Administrator", value: "ADMINISTRATOR" },
            { label: "User", value: "USER" },
          ],
        },
      },
      {
        accessorKey: "createdAt",
        accessorFn(originalRow) {
          return dateFormat(originalRow.createdAt);
        },
        header: "Created at",
        filterVariant: "date-range",
      },
      {
        header: "Ações",
        Cell(props) {
          return (
            <Box className={classes.actions_container}>
              <ResendValidationEmail user={props.row.original} />
              <UpdateUser user={props.row.original} refetch={refetch} />
              <BanUser user={props.row.original} refetch={refetch} />
              <Link
                href={`/dashboard/administration/users/${props.row.original.userName}`}
              >
                <ActionIcon
                  color="cyan"
                  variant="light"
                  size="lg"
                  title="File Tree"
                >
                  <IconFolder />
                </ActionIcon>
              </Link>
            </Box>
          );
        },
      },
    ],
    [refetch]
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
        // height: "calc(100dvh - 64px - 35.09px - 48px)"
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
