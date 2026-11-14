import { ConflictException } from "@nestjs/common";

import type { Prisma } from "../generated/prisma/client.js";
import type { PrismaService } from "../prisma.service.js";

const ACTIVE = ["QUEUED", "RUNNING"] as const;
const MESSAGE = "You already have a simulation queued or running";

export async function assertNoActiveSimulation(
  prisma: Pick<PrismaService, "simulation">,
  userId: string,
) {
  const active = await prisma.simulation.count({
    where: { userId, status: { in: [...ACTIVE] } },
  });
  if (active > 0) throw new ConflictException(MESSAGE);
}

/**
 * Atomically moves a simulation to QUEUED, rejecting (never waiting) if the
 * user already has an active one or another request is claiming the slot.
 */
export async function claimQueueSlot(
  prisma: PrismaService,
  userId: string,
  id: string,
  rest: Prisma.SimulationUpdateInput = {},
) {
  await prisma.$transaction(async (tx) => {
    const [{ locked }] = await tx.$queryRaw<Array<{ locked: boolean }>>`
      SELECT pg_try_advisory_xact_lock(hashtext(${userId})) AS locked`;
    if (!locked) throw new ConflictException(MESSAGE);
    await assertNoActiveSimulation(tx, userId);
    await tx.simulation.update({
      where: { id },
      data: { ...rest, status: "QUEUED" },
    });
  });
}
