"use server";

import { serverApi } from "@/lib/api";

export async function downloadMDP() {
  const { data } = await serverApi.get(`/downloads/mdp`, {
    responseType: "arraybuffer"
  });

  return Buffer.from(data).toString("base64");
}
