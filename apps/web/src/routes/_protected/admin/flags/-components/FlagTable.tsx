import classes from "./FlagTable.module.css";

import { ActionIcon, Badge, Group, Text } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import {
  MantineReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  MRT_TablePagination,
  useMantineReactTable,
} from "mantine-react-table-open";
import { useMemo, useState } from "react";

import { ActionIconLink } from "@/components/RouterComponents";
import { type FeatureFlag } from "@/queries/getFeatureFlags";

const FLAG_TYPE_COLORS: Record<string, string> = {
  BOOLEAN: "teal",
  STRING: "blue",
  NUMBER: "orange",
};

interface FlagTableProps {
  data: FeatureFlag[];
  isDeleting: boolean;
  onDelete: (key: string) => void;
}

export function FlagTable({ data, isDeleting, onDelete }: FlagTableProps) {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = useMemo<MRT_ColumnDef<FeatureFlag>[]>(
    () => [
      {
        accessorKey: "key",
        header: "Key",
        size: 220,
        Cell: ({ cell }) => (
          <Text ff="monospace" fw={700} size="sm" truncate="end">
            {cell.getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        size: 100,
        enableColumnFilter: false,
        Cell: ({ cell }) => {
          const type = cell.getValue<string>();
          return (
            <Badge
              color={FLAG_TYPE_COLORS[type] ?? "gray"}
              size="sm"
              variant="light"
            >
              {type}
            </Badge>
          );
        },
      },
      {
        accessorKey: "enabled",
        header: "Status",
        size: 80,
        enableColumnFilter: false,
        Cell: ({ cell }) => {
          const enabled = cell.getValue<boolean>();
          return (
            <Badge color={enabled ? "green" : "red"} size="sm" variant="filled">
              {enabled ? "On" : "Off"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "defaultVariant",
        header: "Default Variant",
        size: 140,
      },
      {
        accessorKey: "description",
        header: "Description",
        size: 250,
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          if (!value) {
            return (
              <Text c="dimmed" fs="italic" size="sm" truncate="end">
                No description
              </Text>
            );
          }
          return (
            <Text c="dimmed" size="sm" truncate="end">
              {value}
            </Text>
          );
        },
      },
    ],
    [],
  );

  const table = useMantineReactTable({
    data,
    columns,
    displayColumnDefOptions: {
      "mrt-row-actions": {
        size: 72,
      },
    },
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableGlobalFilter: true,
    enableHiding: false,
    enablePagination: true,
    enableRowActions: true,
    enableSorting: true,
    enableStickyHeader: true,
    enableTopToolbar: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      showGlobalFilter: true,
    },
    layoutMode: "grid",
    manualPagination: false,
    mantinePaginationProps: {
      showRowsPerPage: false,
    },
    mantinePaperProps: { className: classes.paper },
    mantineSearchTextInputProps: {
      placeholder: "Search flags…",
    },
    mantineTableBodyProps: {
      className: data.length === 0 ? classes.emptyTableBody : classes.tableBody,
    },
    mantineTableBodyCellProps: { className: classes.bodyCell },
    mantineTableBodyRowProps: { className: classes.bodyRow },
    mantineTableContainerProps: { className: classes.tableContainer },
    mantineTableHeadCellProps: { className: classes.headCell },
    mantineTableHeadRowProps: { className: classes.headRow },
    mantineTableProps: { highlightOnHover: true },
    onPaginationChange: setPagination,
    paginationDisplayMode: "pages",
    renderRowActions: ({ row }) => (
      <ActionIcon.Group>
        <ActionIconLink
          params={{ key: row.original.key }}
          to="/admin/flags/$key"
          variant="subtle"
          size="lg"
        >
          <IconEdit size={18} />
        </ActionIconLink>
        <ActionIcon
          color="red"
          loading={isDeleting}
          onClick={() => onDelete(row.original.key)}
          size="lg"
          variant="subtle"
        >
          <IconTrash size={18} />
        </ActionIcon>
      </ActionIcon.Group>
    ),
    renderBottomToolbar: ({ table }) => (
      <Group
        className={classes.bottomToolbar}
        justify="space-between"
        wrap="nowrap"
      >
        <Text c="dimmed" size="sm">
          {data.length} flag{data.length !== 1 ? "s" : ""}
        </Text>
        <MRT_TablePagination className={classes.pagination} table={table} />
      </Group>
    ),
    renderEmptyRowsFallback: () => (
      <Text c="dimmed" className={classes.emptyState} size="sm">
        No feature flags configured yet.
      </Text>
    ),
    state: { pagination },
  });

  return <MantineReactTable table={table} />;
}
