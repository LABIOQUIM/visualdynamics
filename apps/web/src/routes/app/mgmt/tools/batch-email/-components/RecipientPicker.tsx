import classes from "./RecipientPicker.module.css";

import {
  Alert,
  Badge,
  Box,
  Checkbox,
  Code,
  Divider,
  Group,
  Loader,
  Pagination,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconSearch } from "@tabler/icons-react";

type BatchUser = {
  id: string;
  name: string | null;
  email: string;
};

interface RecipientPickerProps {
  error: unknown;
  isError: boolean;
  isLoading: boolean;
  isSelectingAll: boolean;
  onPageChange: (pageIndex: number) => void;
  onSearchChange: (value: string) => void;
  onToggleAll: () => void;
  onToggleUser: (email: string) => void;
  page: number;
  pageSize: number;
  search: string;
  selected: Set<string>;
  total: number;
  users: BatchUser[];
}

export function RecipientPicker({
  error,
  isError,
  isLoading,
  isSelectingAll,
  onPageChange,
  onSearchChange,
  onToggleAll,
  onToggleUser,
  page,
  pageSize,
  search,
  selected,
  total,
  users,
}: RecipientPickerProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const allSelected = total > 0 && selected.size >= total;
  const someSelected = selected.size > 0 && !allSelected;

  return (
    <Stack className={classes.root} gap="sm">
      <Group justify="space-between">
        <Title order={5}>Recipients</Title>
        <Badge color="blue" variant="light">
          {selected.size} selected
        </Badge>
      </Group>

      <TextInput
        leftSection={<IconSearch size={14} />}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        placeholder="Search by email…"
        value={search}
      />

      {isLoading ? (
        <Group justify="center" py="xl">
          <Loader size="sm" />
        </Group>
      ) : isError ? (
        <Alert
          color="red"
          icon={<IconAlertCircle size={16} />}
          title="Failed to load users"
        >
          {error instanceof Error ? error.message : "Unknown error"}
        </Alert>
      ) : (
        <>
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            disabled={isSelectingAll}
            label={
              <Text fw={500} size="sm">
                {isSelectingAll
                  ? "Selecting…"
                  : allSelected
                    ? `Deselect all (${total})`
                    : `Select all (${total})`}
              </Text>
            }
            onChange={onToggleAll}
          />
          <Divider />
          <ScrollArea className={classes.scrollArea} offsetScrollbars>
            <Stack gap={4}>
              {users.length === 0 && (
                <Text c="dimmed" size="sm">
                  No users found.
                </Text>
              )}
              {users.map((u) => (
                <Box
                  className={`${classes.userRow} ${selected.has(u.email) ? classes.userRowSelected : ""}`}
                  key={u.id}
                  onClick={() => onToggleUser(u.email)}
                  px="xs"
                  py={6}
                >
                  <Group gap="sm" wrap="nowrap">
                    <Checkbox
                      checked={selected.has(u.email)}
                      onChange={() => onToggleUser(u.email)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className={classes.userMeta}>
                      <Text fw={500} size="sm" truncate>
                        {u.name ?? u.email}
                      </Text>
                      <Code className={classes.emailCode}>{u.email}</Code>
                    </div>
                  </Group>
                </Box>
              ))}
            </Stack>
          </ScrollArea>
          {totalPages > 1 && (
            <Pagination
              onChange={(p) => onPageChange(p - 1)}
              size="xs"
              total={totalPages}
              value={page + 1}
            />
          )}
        </>
      )}
    </Stack>
  );
}
