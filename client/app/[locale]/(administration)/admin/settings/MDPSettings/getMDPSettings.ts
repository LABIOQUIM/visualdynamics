"use server";

import { serverApi } from "@/lib/api";

export async function getMDPSettings() {
  const { data } = await serverApi.get<GetMDPSettingsResult>("/mdpr");

  return data;
}
