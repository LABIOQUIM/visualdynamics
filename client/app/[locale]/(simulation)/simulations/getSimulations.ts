"use server";

import { Simulation } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getSimulations(
  username: string
): Promise<GetSimulationsReturn | undefined> {
  try {
    const APOSimulations: Simulation[] = await prisma.simulation.findMany({
      where: {
        user: {
          username
        },
        type: "APO"
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const ACPYPESimulations: Simulation[] = await prisma.simulation.findMany({
      where: {
        user: {
          username
        },
        type: "ACPYPE"
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const PRODRGSimulations: Simulation[] = await prisma.simulation.findMany({
      where: {
        user: {
          username
        },
        type: "PRODRG"
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return {
      apo: APOSimulations[0] ?? undefined,
      acpype: ACPYPESimulations[0] ?? undefined,
      prodrg: PRODRGSimulations[0] ?? undefined
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch {
    return undefined;
  }
}
