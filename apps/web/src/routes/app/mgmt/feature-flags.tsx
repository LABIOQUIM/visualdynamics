import classes from "./feature-flags.module.css";

import {
  ActionIcon,
  Badge,
  Button,
  Group,
  JsonInput,
  Modal,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconPencil,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  MantineReactTable,
  type MRT_ColumnDef,
  useMantineReactTable,
} from "mantine-react-table-open";
import { useCallback, useMemo, useState } from "react";

import { Heading } from "@/components/Heading";
import { PageLayout } from "@/components/PageLayout";
import { TableDateCell } from "@/components/TableDateCell";
import {
  createFeatureFlag,
  type CreateFeatureFlagInput,
  deleteFeatureFlag,
  updateFeatureFlag,
  type UpdateFeatureFlagInput,
} from "@/mutations/featureFlags";
import { type FeatureFlag, getFeatureFlags } from "@/queries/getFeatureFlags";

export const Route = createFileRoute("/app/mgmt/feature-flags")({
  component: RouteComponent,
});

const FLAG_TYPE_OPTIONS = [
  { value: "BOOLEAN", label: "Boolean" },
  { value: "STRING", label: "String" },
  { value: "NUMBER", label: "Number" },
];

const FLAG_TYPE_COLORS: Record<string, string> = {
  BOOLEAN: "teal",
  STRING: "blue",
  NUMBER: "orange",
};

function CreateFlagModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [key, setKey] = useState("");
  const [type, setType] = useState<string>("BOOLEAN");
  const [enabled, setEnabled] = useState(true);
  const [defaultVariant, setDefaultVariant] = useState("on");
  const [variantsJson, setVariantsJson] = useState(
    '{ "on": true, "off": false }',
  );
  const [description, setDescription] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateFeatureFlagInput) => createFeatureFlag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
      notifications.show({
        message: "Feature flag created",
        color: "green",
        icon: <IconCheck />,
        withBorder: true,
      });
      resetForm();
      onClose();
    },
    onError: (error) => {
      notifications.show({
        message: error.message,
        color: "red",
        icon: <IconX />,
        withBorder: true,
      });
    },
  });

  const resetForm = useCallback(() => {
    setKey("");
    setType("BOOLEAN");
    setEnabled(true);
    setDefaultVariant("on");
    setVariantsJson('{ "on": true, "off": false }');
    setDescription("");
  }, []);

  const handleSubmit = useCallback(() => {
    let variants: Record<string, unknown>;
    try {
      variants = JSON.parse(variantsJson) as Record<string, unknown>;
    } catch {
      notifications.show({
        message: "Invalid JSON for variants",
        color: "red",
        icon: <IconX />,
        withBorder: true,
      });
      return;
    }

    mutate({
      key,
      type: type as CreateFeatureFlagInput["type"],
      enabled,
      defaultVariant,
      variants,
      description: description || undefined,
    });
  }, [key, type, enabled, defaultVariant, variantsJson, description, mutate]);

  return (
    <Modal
      centered
      onClose={onClose}
      opened={opened}
      size="lg"
      title="Create Feature Flag"
    >
      <Stack>
        <TextInput
          label="Key"
          onChange={(e) => setKey(e.currentTarget.value)}
          placeholder="my-feature-flag"
          required
          value={key}
        />
        <Select
          data={FLAG_TYPE_OPTIONS}
          label="Type"
          onChange={(v) => setType(v ?? "BOOLEAN")}
          required
          value={type}
        />
        <Switch
          checked={enabled}
          label="Enabled"
          onChange={(e) => setEnabled(e.currentTarget.checked)}
        />
        <TextInput
          label="Default Variant"
          onChange={(e) => setDefaultVariant(e.currentTarget.value)}
          placeholder="on"
          required
          value={defaultVariant}
        />
        <JsonInput
          autosize
          formatOnBlur
          label="Variants (JSON)"
          minRows={3}
          onChange={setVariantsJson}
          placeholder='{ "on": true, "off": false }'
          value={variantsJson}
        />
        <TextInput
          label="Description"
          onChange={(e) => setDescription(e.currentTarget.value)}
          placeholder="Describe what this flag controls"
          value={description}
        />
        <Group justify="flex-end">
          <Button onClick={onClose} variant="subtle">
            Cancel
          </Button>
          <Button
            disabled={!key || !defaultVariant}
            leftSection={<IconPlus size={16} />}
            loading={isPending}
            onClick={handleSubmit}
          >
            Create
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function EditFlagModal({
  flag,
  opened,
  onClose,
}: {
  flag: FeatureFlag | null;
  opened: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(flag?.enabled ?? true);
  const [defaultVariant, setDefaultVariant] = useState(
    flag?.defaultVariant ?? "",
  );
  const [variantsJson, setVariantsJson] = useState(
    flag ? JSON.stringify(flag.variants, null, 2) : "{}",
  );
  const [description, setDescription] = useState(flag?.description ?? "");

  // Sync state when flag changes
  useMemo(() => {
    if (flag) {
      setEnabled(flag.enabled);
      setDefaultVariant(flag.defaultVariant);
      setVariantsJson(JSON.stringify(flag.variants, null, 2));
      setDescription(flag.description ?? "");
    }
  }, [flag]);

  const { mutate, isPending } = useMutation({
    mutationFn: ({ key, data }: { key: string; data: UpdateFeatureFlagInput }) =>
      updateFeatureFlag(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
      notifications.show({
        message: "Feature flag updated",
        color: "green",
        icon: <IconCheck />,
        withBorder: true,
      });
      onClose();
    },
    onError: (error) => {
      notifications.show({
        message: error.message,
        color: "red",
        icon: <IconX />,
        withBorder: true,
      });
    },
  });

  const handleSubmit = useCallback(() => {
    if (!flag) return;

    let variants: Record<string, unknown>;
    try {
      variants = JSON.parse(variantsJson) as Record<string, unknown>;
    } catch {
      notifications.show({
        message: "Invalid JSON for variants",
        color: "red",
        icon: <IconX />,
        withBorder: true,
      });
      return;
    }

    mutate({
      key: flag.key,
      data: {
        enabled,
        defaultVariant,
        variants,
        description: description || undefined,
      },
    });
  }, [flag, enabled, defaultVariant, variantsJson, description, mutate]);

  if (!flag) return null;

  return (
    <Modal
      centered
      onClose={onClose}
      opened={opened}
      size="lg"
      title={`Edit: ${flag.key}`}
    >
      <Stack>
        <TextInput disabled label="Key" value={flag.key} />
        <TextInput disabled label="Type" value={flag.type} />
        <Switch
          checked={enabled}
          label="Enabled"
          onChange={(e) => setEnabled(e.currentTarget.checked)}
        />
        <TextInput
          label="Default Variant"
          onChange={(e) => setDefaultVariant(e.currentTarget.value)}
          required
          value={defaultVariant}
        />
        <JsonInput
          autosize
          formatOnBlur
          label="Variants (JSON)"
          minRows={3}
          onChange={setVariantsJson}
          value={variantsJson}
        />
        <TextInput
          label="Description"
          onChange={(e) => setDescription(e.currentTarget.value)}
          value={description}
        />
        <Group justify="flex-end">
          <Button onClick={onClose} variant="subtle">
            Cancel
          </Button>
          <Button
            leftSection={<IconCheck size={16} />}
            loading={isPending}
            onClick={handleSubmit}
          >
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function RouteComponent() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(getFeatureFlags());
  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [editFlag, setEditFlag] = useState<FeatureFlag | null>(null);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  const deleteMutation = useMutation({
    mutationFn: (key: string) => deleteFeatureFlag(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
      notifications.show({
        message: "Feature flag deleted",
        color: "green",
        icon: <IconCheck />,
        withBorder: true,
      });
    },
    onError: (error) => {
      notifications.show({
        message: error.message,
        color: "red",
        icon: <IconX />,
        withBorder: true,
      });
    },
  });

  const handleEdit = useCallback(
    (flag: FeatureFlag) => {
      setEditFlag(flag);
      openEdit();
    },
    [openEdit],
  );

  const handleDelete = useCallback(
    (key: string) => {
      deleteMutation.mutate(key);
    },
    [deleteMutation],
  );

  const columns = useMemo<MRT_ColumnDef<FeatureFlag>[]>(
    () => [
      {
        accessorKey: "key",
        header: "Key",
        Cell: ({ cell }) => (
          <Text fw={500} size="sm">
            {cell.getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        size: 100,
        Cell: ({ cell }) => {
          const type = cell.getValue<string>();
          return (
            <Badge color={FLAG_TYPE_COLORS[type] ?? "gray"} variant="light">
              {type}
            </Badge>
          );
        },
      },
      {
        accessorKey: "enabled",
        header: "Enabled",
        size: 100,
        Cell: ({ cell }) => {
          const enabled = cell.getValue<boolean>();
          return (
            <Badge color={enabled ? "green" : "red"} variant="light">
              {enabled ? "Yes" : "No"}
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
        accessorKey: "variants",
        header: "Value",
        Cell: ({ row }) => {
          const variants = row.original.variants;
          const defaultVariant = row.original.defaultVariant;
          const value = variants?.[defaultVariant];
          return (
            <Text ff="monospace" size="sm">
              {JSON.stringify(value)}
            </Text>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        Cell: ({ cell }) => {
          const desc = cell.getValue<string | null>();
          return desc ? (
            <Text lineClamp={1} size="sm">
              {desc}
            </Text>
          ) : (
            <Text c="dimmed" size="sm">
              —
            </Text>
          );
        },
      },
      {
        accessorKey: "updatedAt",
        header: "Updated At",
        size: 160,
        Cell: TableDateCell,
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        size: 160,
        Cell: TableDateCell,
      },
    ],
    [],
  );

  const table = useMantineReactTable({
    data: data ?? [],
    columns,
    enablePagination: false,
    enableTopToolbar: false,
    enableStickyHeader: true,
    enableEditing: true,
    enableRowActions: true,
    positionActionsColumn: "last",
    state: { isLoading },
    layoutMode: "grid",
    getRowId: (row) => row.id,
    renderRowActions: ({ row }) => (
      <Group gap="xs" wrap="nowrap">
        <Tooltip label="Edit">
          <ActionIcon
            onClick={() => handleEdit(row.original)}
            size="sm"
            variant="subtle"
          >
            <IconPencil size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete">
          <ActionIcon
            color="red"
            loading={deleteMutation.isPending}
            onClick={() => handleDelete(row.original.key)}
            size="sm"
            variant="subtle"
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
    ),
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
  });

  return (
    <PageLayout>
      <Heading
        rightElement={
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openCreate}
            size="sm"
          >
            New Flag
          </Button>
        }
        title="Feature Flags"
      />
      <MantineReactTable table={table} />
      <CreateFlagModal onClose={closeCreate} opened={createOpened} />
      <EditFlagModal flag={editFlag} onClose={closeEdit} opened={editOpened} />
    </PageLayout>
  );
}
