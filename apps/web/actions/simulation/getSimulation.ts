"use server";
import { Simulation } from "database";

import { api } from "@/lib/apis";

import { validateAuth } from "../auth/validateAuth";

export type RunningSimulation =
  | {
      status: "running";
      logData: string[];
      stepData: string[];
      submissionInfo: Partial<Simulation>;
    }
  | { status: "not-running" }
  | { status: "queued"; position: number };

export async function getSimulation(simulationId: string) {
  const { user } = await validateAuth();

  if (!user) {
    return "unauthenticated";
  }

  const response = await api.get<RunningSimulation>("/simulation", {
    headers: {
      "x-username": user.userName,
    },
    params: {
      id: simulationId,
    },
  });

  return response.data;
}
