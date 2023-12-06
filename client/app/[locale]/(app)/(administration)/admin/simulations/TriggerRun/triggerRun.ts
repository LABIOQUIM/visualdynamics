"use server";

import { serverApi } from "@/lib/api";

export async function triggerRun(folder: string, email: string) {
  return await serverApi.post(
    "/run",
    {
      folder,
      email
    },
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
}
