"use server";

import { serverApi } from "@/lib/api";

export async function updateMDPSettings(data: FormData) {
  await serverApi.put("/mdpr", data, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
}
