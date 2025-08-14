"use server";
import { api } from "@/lib/apis";

import { validateAuth } from "../auth/validateAuth";

type ResponseData =
  | { status: "generated"; commands: string[] }
  | { status: "added-to-queue"; simulationId: string }
  | { status: "queued-or-running" };

export async function submitNewSimulation(
  data: FormData,
  simulationType: SimulationType
) {
  const { user } = await validateAuth();

  if (!user) {
    return { status: "unauthenticated" } as const;
  }

  try {
    const response = await api.post<ResponseData>(
      `/simulation/${simulationType}`,
      data,
      {
        headers: {
          "x-username": user.userName,
        },
      }
    );

    return response.data;
  } catch (err: any) {
    console.log(err);
    if (err.status === 409) {
      return { status: "queued-or-running" } as const;
    }

    return { status: "unknown-error" } as const;
  }
}
