"use server";

import { serverApi } from "@/lib/api";

export async function getQueuedSimulations(): Promise<GetCelerySimulationsResult> {
  const { data } = await serverApi.get<GetCelerySimulationsResult>(
    "/celery/queued"
  );

  return data;
}
