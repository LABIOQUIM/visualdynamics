import { Button, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { MRT_TableInstance } from "mantine-react-table-open";
import { useCallback, useMemo } from "preact/hooks";

import type { ImporterUser } from "./Provider";

import { authClient } from "@/lib/auth-client";

type Props = {
  table: MRT_TableInstance<ImporterUser>;
};

export function ImportButton({ table }: Props) {
  const [opened, { open, close }] = useDisclosure(false);

  const selectedRows = useMemo(
    () => table.getSelectedRowModel().rows,
    [table.getSelectedRowModel().rows],
  );

  const onImport = useCallback(async () => {
    for (const user of selectedRows) {
      await authClient.admin.createUser({
        email: user.original.email.trim(),
        name: user.original.name.trim(),
        // @ts-expect-error
        role: user.original.role.trim(),
        data: {
          username: user.original.username.trim(),
          displayUsername: user.original.username.trim(),
        },
      });
    }
  }, [selectedRows]);

  return (
    <>
      <Modal centered onClose={close} opened={opened} title="Import Users">
        <Text>
          This action will try to import {selectedRows.length} users to the
          system.
        </Text>

        <Button fullWidth mt="md" onClick={onImport}>
          Confirm Import
        </Button>
      </Modal>
      <Button onClick={open}>Import</Button>
    </>
  );
}
