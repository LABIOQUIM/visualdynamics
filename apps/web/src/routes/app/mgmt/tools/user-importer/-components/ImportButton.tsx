import { Button, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useQuery } from "@tanstack/react-query";
import type { MRT_TableInstance } from "mantine-react-table-open";
import { useCallback, useMemo, useState } from "preact/hooks";

import type { ImporterUser } from "./Provider";

import { authClient } from "@/lib/auth-client";
import { getMgmtUsers } from "@/queries/getMgmtUsers";

type Props = {
  table: MRT_TableInstance<ImporterUser>;
};

export function ImportButton({ table }: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const [isPending, setPending] = useState(false);
  const { refetch } = useQuery(getMgmtUsers({}));

  const selectedRows = useMemo(
    () => table.getSelectedRowModel().rows,
    [table.getSelectedRowModel().rows],
  );

  const onImport = useCallback(async () => {
    setPending(true);
    for await (const user of selectedRows) {
      await authClient.admin.createUser({
        email: user.original.email.trim(),
        name: user.original.name.trim(),
        // @ts-expect-error
        role: user.original.role.trim(),
        data: {
          username: user.original.username.trim(),
          displayUsername: user.original.username.trim(),
          createdAt: user.original.createdAt,
          updatedAt: user.original.updatedAt,
        },
      });
    }
    notifications.show({
      message: `Imported ${selectedRows.length} users`,
      color: "green",
    });
    table.resetRowSelection();
    refetch();
    close();
    setPending(false);
  }, [selectedRows]);

  return (
    <>
      <Modal centered onClose={close} opened={opened} title="Import Users">
        <Text>
          This action will try to import {selectedRows.length} users to the
          system.
        </Text>

        <Button fullWidth loading={isPending} mt="md" onClick={onImport}>
          Confirm Import
        </Button>
      </Modal>
      <Button onClick={open}>Import</Button>
    </>
  );
}
