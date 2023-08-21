"use server";

import { serverApi } from "@/lib/api";

export async function getSimulations(
  username: string
): Promise<GetSimulationsResult> {
  try {
    if (!username) {
      return {
        status: "no-username"
      };
    }

    const { data } = await serverApi.get<GetSimulationsResult>("/simulations", {
      params: {
        username
      }
    });

    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch {
    return {
      status: "failed"
    };
  }
}
