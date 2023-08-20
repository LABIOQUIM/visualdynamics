"use server";

import { serverApi } from "@/lib/api";

export async function abortSimulation(taskId: string, folder: string) {
  const formData = new FormData();

  formData.append("taskId", taskId);
  formData.append("folder", folder);

  const { data } = await serverApi.post("/run/abort", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  if (data && data.status && data.status === "aborted") {
    return "aborted";
  }

  return "failed-to-abort";
}
