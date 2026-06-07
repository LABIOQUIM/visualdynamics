import { notifications } from "@mantine/notifications";

import { getAPIClient } from "@/lib/api";

export async function downloadUserFile(
  userId: string,
  path: string,
): Promise<void> {
  try {
    const api = await getAPIClient();
    const { data } = await api.get<ArrayBuffer>(
      "/simulation/admin/download-user-file",
      {
        params: { userId, path },
        responseType: "arraybuffer",
      },
    );

    const blob = new Blob([data]);
    const url = URL.createObjectURL(blob);

    const fileName = path.split("/").pop() ?? "download";
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch {
    notifications.show({
      message: "Failed to download file",
      color: "red",
      withBorder: true,
    });
  }
}
