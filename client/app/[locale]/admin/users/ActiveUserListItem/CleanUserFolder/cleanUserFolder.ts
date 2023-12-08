"use server";

import { serverApi } from "@/lib/api";

export async function cleanUserFolder(username: string) {
  const data = new FormData();
  data.append("username", username);
  await serverApi.post("/simulations/clean", data);
}
