"use server";

import { serverApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export type GetRunningSimulationResult =
  | {
      info: Simulation & {
        folder: string;
        celeryId: string;
      };
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

    const simulation: Simulation | null = await prisma.simulation.findFirst({
      where: {
        user: {
          username
        },
        OR: [
          {
            status: "RUNNING"
          },
          {
            status: "QUEUED"
          }
        ]
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (simulation === null) {
      return {
        status: "not-running"
      };
    }

    const { data } = await serverApi.get<GetRunningSimulationResult>("/run", {
      params: {
        username
      }
    });

    if (data.status === "running") {
      return {
        ...data,
        info: {
          ...data.info,
          ...simulation
        }
      };
    }

    return data;
  } catch {
    return {
      status: "failed-to-fetch"
    };
  }
}
