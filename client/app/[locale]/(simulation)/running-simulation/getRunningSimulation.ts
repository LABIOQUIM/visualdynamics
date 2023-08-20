"use server";

import { serverApi } from "@/lib/api";

export type SimulationInfo = {
  timestamp: string;
  molecule: string;
  type: "APO" | "ACPYPE" | "PRODRG";
  celeryId: string;
  folder: string;
};

export type GetRunningSimulationResult =
  | {
      info: SimulationInfo;
      steps: string[];
      log: string[];
      status: "running";
    }
  | {
      status: "not-running" | "no-username" | "queued" | "failed-to-fetch";
    };

export async function getRunningSimulation(
  username: string
): Promise<GetRunningSimulationResult> {
  try {
    if (!username) {
      return {
        status: "no-username"
      };
    }

    const { data } = await serverApi.get<GetRunningSimulationResult>("/run", {
      params: {
        username
      }
    });

    return data;
  } catch {
    return {
      status: "failed-to-fetch"
    };
  }
}
