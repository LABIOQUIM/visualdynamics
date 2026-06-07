import classes from "./ImportTable.module.css";

import { useCallback, useMemo, useRef } from "react";
import { usePapaParse } from "react-papaparse";
import { Button, Group, Stack, Text } from "@mantine/core";
import {
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table-open";

import { ImportButton } from "./ImportButton";
import {
  type ImporterSimulation,
  type ImporterUserRow,
  useSimulationImporter,
} from "./Provider";

import { StatusBadge } from "@/components/StatusBadge";
import { TableDateCell } from "@/components/TableDateCell";
import { TableTextCell } from "@/components/TableTextCell";
import { TypeBadge } from "@/components/TypeBadge";

export function ImportTable() {
  const { simulations, users, setUsers } = useSimulationImporter();
  const { readString } = usePapaParse();
  const usersInputRef = useRef<HTMLInputElement>(null);

  const onUsersFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      file.text().then((csvText) => {
        readString(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setUsers(results.data as ImporterUserRow[]);
          },
        });
      });
      e.target.value = "";
    },
    [readString, setUsers],
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        Cell: TableTextCell,
      },
      {
        accessorKey: "user_id",
        header: "User",
        Cell: ({ cell, row }: any) => {
          const match = users.find((u) => u.id === row.original.user_id);
          if (match) {
            return (
              <Stack gap={0}>
                <Text fz="sm">{match.user_name}</Text>
                <Text c="dimmed" fz="xs">
                  {match.email}
                </Text>
              </Stack>
            );
          }
          return <TableTextCell cell={cell} />;
        },
      },
      {
        accessorKey: "molecule_name",
        header: "Macromolecule",
        Cell: TableTextCell,
      },
      {
        accessorKey: "type",
        header: "Type",
        Cell: ({ cell }: any) => (
          <TypeBadge type={cell.getValue() as SIMULATION_TYPE} />
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        Cell: ({ cell }: any) => (
          <StatusBadge status={cell.getValue() as SIMULATION_STATUS} />
        ),
      },
      {
        accessorKey: "ligand_itp_name",
        header: "Ligand ITP",
        Cell: TableTextCell,
      },
      {
        accessorKey: "ligand_pdb_name",
        header: "Ligand PDB",
        Cell: TableTextCell,
      },
      {
        accessorKey: "started_at",
        header: "Started At",
        Cell: TableDateCell,
      },
      {
        accessorKey: "ended_at",
        header: "Ended At",
        Cell: TableDateCell,
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        Cell: TableDateCell,
      },
    ],
    [users],
  );

  const table = useMantineReactTable<ImporterSimulation>({
    data: simulations,
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
      <Group>
        <input
          accept=".csv"
          onChange={onUsersFileChange}
          ref={usersInputRef}
          style={{ display: "none" }}
          type="file"
        />
        <Button
          {...(users.length > 0 ? { color: "green" } : {})}
          onClick={() => usersInputRef.current?.click()}
          variant="light"
        >
          {users.length > 0 ? `${users.length} users loaded` : "Load Users CSV"}
        </Button>
        <ImportButton table={table} />
      </Group>
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
    columns,
  });

  return <MantineReactTable table={table} />;
}
