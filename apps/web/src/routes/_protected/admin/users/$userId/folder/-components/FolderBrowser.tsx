import {
  ActionIcon,
  Anchor,
  Breadcrumbs,
  Paper,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconDownload,
  IconFile,
  IconFolder,
  IconHome,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import { Loader } from "@/components/Loader";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { deleteUserFile } from "@/mutations/deleteUserFile";
import { downloadUserFile } from "@/mutations/downloadUserFile";
import { getUserFolderFiles } from "@/queries/getUserFolderFiles";
import { formatBytes } from "@/routes/_protected/admin/server/-components/formatters";

interface FolderBrowserProps {
  path: string;
  userId: string;
  username: string;
}

function formatDate(ms: number) {
  const d = new Date(ms);
  return d.toLocaleString();
}

const iconStyle = { height: 16, width: 16 };

export function FolderBrowser({ path, userId, username }: FolderBrowserProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: rawEntries = [], isLoading } = useQuery(
    getUserFolderFiles(userId, path),
  );

  const entries = useMemo(
    () =>
      [...rawEntries].sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "directory" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      }),
    [rawEntries],
  );

  async function handleDelete(entryPath: string, name: string) {
    try {
      const result = await deleteUserFile(userId, entryPath);
      if (result.success) {
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.mgmtUserFolder(userId, path),
        });
        notifications.show({
          message: `Deleted ${name}`,
          color: "green",
          icon: <IconCheck />,
          withBorder: true,
        });
      } else {
        notifications.show({
          message: `Failed to delete ${name}`,
          color: "red",
          icon: <IconX />,
          withBorder: true,
        });
      }
    } catch {
      notifications.show({
        message: `Failed to delete ${name}`,
        color: "red",
        icon: <IconX />,
        withBorder: true,
      });
    }
  }

  const pathSegments = path ? path.split("/").filter(Boolean) : [];

  const breadcrumbItems = [
    {
      label: (
        <>
          <IconHome
            style={{ ...iconStyle, verticalAlign: "middle", marginRight: 4 }}
          />
          {username}
        </>
      ),
      path: "",
    },
    ...pathSegments.map((segment, index) => {
      const breadcrumbPath = pathSegments.slice(0, index + 1).join("/");
      return {
        label: segment,
        path: breadcrumbPath,
      };
    }),
  ];

  function navigateTo(targetPath: string) {
    void navigate({
      to: "/admin/users/$userId/folder",
      params: { userId },
      search: { path: targetPath || undefined },
      replace: true,
    });
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Breadcrumbs mb="md" separator="/">
        {breadcrumbItems.map((item, index) =>
          index === breadcrumbItems.length - 1 ? (
            <Text key={item.path} size="sm">
              {item.label}
            </Text>
          ) : (
            <Anchor
              key={item.path}
              onClick={() => navigateTo(item.path)}
              size="sm"
              style={{ cursor: "pointer" }}
            >
              {item.label}
            </Anchor>
          ),
        )}
      </Breadcrumbs>

      <Paper withBorder>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th w={100}>Type</Table.Th>
              <Table.Th w={120}>Size</Table.Th>
              <Table.Th w={180}>Last Modified</Table.Th>
              <Table.Th w={120}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {entries.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text c="dimmed" ta="center">
                    This folder is empty
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              entries.map((entry) => (
                <Table.Tr key={entry.path}>
                  <Table.Td>
                    {entry.type === "directory" ? (
                      <Anchor
                        onClick={() => navigateTo(entry.path)}
                        style={{ cursor: "pointer" }}
                      >
                        <IconFolder
                          style={{
                            ...iconStyle,
                            marginRight: 8,
                            verticalAlign: "middle",
                          }}
                        />
                        {entry.name}
                      </Anchor>
                    ) : (
                      <Text component="span">
                        <IconFile
                          style={{
                            ...iconStyle,
                            marginRight: 8,
                            verticalAlign: "middle",
                          }}
                        />
                        {entry.name}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {entry.type}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {entry.type === "directory"
                        ? "--"
                        : formatBytes(entry.size)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatDate(entry.lastModified)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon.Group>
                      {entry.type === "file" && (
                        <Tooltip label="Download">
                          <ActionIcon
                            onClick={() =>
                              void downloadUserFile(userId, entry.path)
                            }
                            size="sm"
                            variant="subtle"
                          >
                            <IconDownload />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      <Tooltip label="Delete">
                        <ActionIcon
                          color="red"
                          onClick={() => handleDelete(entry.path, entry.name)}
                          size="sm"
                          variant="subtle"
                        >
                          <IconTrash />
                        </ActionIcon>
                      </Tooltip>
                    </ActionIcon.Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </>
  );
}
