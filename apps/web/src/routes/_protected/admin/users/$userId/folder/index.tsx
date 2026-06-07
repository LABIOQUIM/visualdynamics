import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Button, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft, IconCheck, IconX } from "@tabler/icons-react";

import { PageLayout } from "@/components/PageLayout";
import { Loader } from "@/components/Loader";
import { cleanUserFolder } from "@/mutations/cleanUserFolder";
import { getMgmtUser } from "@/queries/getMgmtUser";
import { FolderBrowser } from "./-components/FolderBrowser";

const searchSchema = z.object({
  path: z.string().optional(),
});

export const Route = createFileRoute("/_protected/admin/users/$userId/folder/")(
  {
    validateSearch: searchSchema,
    component: RouteComponent,
    staticData: {
      breadcrumb: "File Manager",
    },
  },
);

function RouteComponent() {
  const { userId } = Route.useParams();
  const { path } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery(getMgmtUser(userId));

  async function handleCleanFolder() {
    try {
      await cleanUserFolder(userId);
      notifications.show({
        message: "User folder cleaned successfully",
        color: "green",
        icon: <IconCheck />,
        withBorder: true,
      });
      void queryClient.invalidateQueries({
        queryKey: ["mgmt-user-folder"],
      });
    } catch (err) {
      notifications.show({
        message:
          err instanceof Error ? err.message : "Failed to clean user folder",
        color: "red",
        icon: <IconX />,
        withBorder: true,
      });
    }
  }

  if (isLoading || !user) {
    return <Loader />;
  }

  return (
    <PageLayout
      rightElement={
        <Group>
          <Button
            color="orange"
            onClick={() => void handleCleanFolder()}
            size="xs"
            variant="light"
          >
            Clean Folder
          </Button>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => void navigate({ to: "/admin/users" })}
            size="xs"
            variant="light"
          >
            Back to Users
          </Button>
        </Group>
      }
      title={`Files: ${user.username}`}
    >
      <FolderBrowser
        path={path ?? ""}
        userId={userId}
        username={user.username}
      />
    </PageLayout>
  );
}
