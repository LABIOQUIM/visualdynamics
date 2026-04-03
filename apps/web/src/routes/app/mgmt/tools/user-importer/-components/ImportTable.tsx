import classes from "./ImportTable.module.css";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table-open";

import { ImportButton } from "./ImportButton";
import { useUserImporter } from "./Provider";

import { TableDateCell } from "@/components/TableDateCell";
import { TableTextCell } from "@/components/TableTextCell";
import { getMgmtUsers } from "@/queries/getMgmtUsers";

export function ImportTable() {
  const { users } = useUserImporter();
  const { data } = useQuery(getMgmtUsers({}));

  const finalUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          !data?.users.some(
            (u1) =>
              u.email?.toLowerCase() === u1.email?.toLowerCase() ||
              // @ts-expect-error
              u.username?.toLowerCase() === u1.username?.toLowerCase(),
          ),
      ),
    [users, data],
  );

  const table = useMantineReactTable({
    data: finalUsers,
    enableStickyHeader: true,
    enableRowSelection: true,
    selectAllMode: "all",
    enableSelectAll: true,
    paginationDisplayMode: "default",
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
    renderTopToolbarCustomActions: ({ table }) => (
      <ImportButton table={table} />
    ),
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
        Cell: TableTextCell,
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

  return <MantineReactTable table={table} />;
}
