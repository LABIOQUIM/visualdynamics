import classes from "./ImportButton.module.css";

import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { Button, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import type { MRT_TableInstance } from "mantine-react-table-open";

import type { ImporterSimulation } from "./Provider";
import { useSimulationImporter } from "./Provider";

import { getAPIClient } from "@/lib/api";

type Props = {
  table: MRT_TableInstance<ImporterSimulation>;
};

export function ImportButton({ table }: Props) {
  const { users } = useSimulationImporter();
  const [opened, { open, close }] = useDisclosure(false);
  const [isPending, setPending] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState<{
    imported: number;
    errors: string[];
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedRows = useMemo(
    () => table.getSelectedRowModel().rows,
    [table.getSelectedRowModel().rows],
  );

  const unmatchedUsers = useMemo(
    () => [
      ...new Set(
        selectedRows
          .map((r) => r.original.user_id)
          .filter((uid) => !users.some((u) => u.id === uid)),
      ),
    ],
    [selectedRows, users],
  );

  const fillWidth =
    progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  const onImport = useCallback(async () => {
    const rows = selectedRows.map((r) => r.original);

    setPending(true);
    setResult(null);
    flushSync(() => setProgress({ done: 0, total: rows.length }));

    const api = await getAPIClient();
    let totalImported = 0;
    const allErrors: string[] = [];

    for (const row of rows) {
      const matchedUser = users.find((u) => u.id === row.user_id);
      const enrichedRow = {
        ...row,
        user_name: (matchedUser?.user_name ?? row.user_id).toLowerCase(),
      };
      try {
        const res = await api
          .post<{ imported: number; errors: string[] }>("/simulation/import", {
            rows: [enrichedRow],
          })
          .then((r) => r.data);

        totalImported += res.imported;
        allErrors.push(...res.errors);
      } catch {
        allErrors.push(`Row ${row.id ?? row.user_id}: request failed`);
      }

      flushSync(() => setProgress((p) => ({ ...p, done: p.done + 1 })));
    }

    const res = { imported: totalImported, errors: allErrors };
    setResult(res);
    setPending(false);

    notifications.show({
      message: `Imported ${res.imported} simulation(s)${res.errors.length ? `, ${res.errors.length} error(s)` : ""}`,
      color: res.errors.length ? "orange" : "green",
    });

    table.resetRowSelection();
  }, [selectedRows, table]);

  return (
    <>
      <Modal
        centered
        closeOnClickOutside={!isPending}
        closeOnEscape={!isPending}
        onClose={close}
        opened={opened}
        title="Import Simulations"
        withCloseButton={!isPending}
      >
        {result ? (
          <Stack>
            <Text>
              Imported <strong>{result.imported}</strong> simulation(s).
            </Text>
            {result.errors.length > 0 && (
              <Stack gap="xs">
                <Text c="red" fw={600}>
                  {result.errors.length} error(s):
                </Text>
                {result.errors.map((e, i) => (
                  <Text c="red" fz="sm" key={i}>
                    {e}
                  </Text>
                ))}
              </Stack>
            )}
            <Button fullWidth onClick={close} variant="default">
              Close
            </Button>
          </Stack>
        ) : (
          <Stack>
            <Text>
              Import <strong>{selectedRows.length}</strong> selected
              simulation(s) into the system?
            </Text>
            {unmatchedUsers.length > 0 && (
              <Stack gap="xs">
                <Text c="orange" fw={600}>
                  {unmatchedUsers.length} user ID(s) not found in users CSV:
                </Text>
                {unmatchedUsers.map((un) => (
                  <Text c="orange" fz="sm" key={un}>
                    {un}
                  </Text>
                ))}
                <Text c="dimmed" fz="xs">
                  These simulations will fail to import if the users do not
                  exist in the database.
                </Text>
              </Stack>
            )}
            <Button
              classNames={{
                root: classes.progressButton,
                inner: classes.inner,
              }}
              disabled={isPending && progress.total === 0}
              fullWidth
              onClick={onImport}
              ref={buttonRef}
              style={{ "--fill-width": `${fillWidth}%` } as React.CSSProperties}
              variant={isPending ? "outline" : "filled"}
            >
              {!isPending && "Confirm Import"}
              {isPending &&
                buttonRef.current &&
                createPortal(
                  <>
                    <span className={classes.primaryLayer}>
                      Importing {progress.done}/{progress.total}…
                    </span>
                    <span className={classes.whiteLayer}>
                      Importing {progress.done}/{progress.total}…
                    </span>
                  </>,
                  buttonRef.current,
                )}
            </Button>
          </Stack>
        )}
      </Modal>

      <Button disabled={selectedRows.length === 0} onClick={open}>
        Import
      </Button>
    </>
  );
}
