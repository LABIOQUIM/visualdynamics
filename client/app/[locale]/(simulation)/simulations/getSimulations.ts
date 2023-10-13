"use server";

import { Simulation } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getSimulations(
  username: string
): Promise<Simulation[] | undefined> {
  try {
    return await prisma.simulation.findMany({
      where: {
        user: {
          username
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch {
    return undefined;
  }
}
