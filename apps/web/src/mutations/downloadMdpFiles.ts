import { notifications } from "@mantine/notifications";

import { getAPIClient } from "@/lib/api";

export async function downloadMdpFiles(): Promise<void> {
  try {
    const api = await getAPIClient();
    const { data } = await api.get<ArrayBuffer>("/simulation/downloads/mdp", {
      responseType: "arraybuffer",
    });

    const blob = new Blob([data], { type: "application/zip" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "mdp_files.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Defer revocation so the browser can start the download before the URL is invalidated
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch {
    notifications.show({
      title: "Download failed",
      message: "Could not download MDP files. Please try again.",
      color: "red",
      withBorder: true,
    });
  }
}
