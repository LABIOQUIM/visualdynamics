"use server";

import { serverApi } from "@/lib/api";

export async function getRunningSimulations(): Promise<GetCelerySimulationsResult> {
  const { data } = await serverApi.get<GetCelerySimulationsResult>(
    "/celery/active"
  );

  return data;
}
