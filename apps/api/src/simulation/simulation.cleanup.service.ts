import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { existsSync, rmSync } from "fs";
import { join } from "path";

import { PrismaService } from "../prisma.service.js";

export const STORAGE_RETENTION_DAYS = 30;

/**
 * Returns the date after which storage for a simulation is deleted.
 * - GENERATED: 30 days after createdAt
 * - All other terminal states (COMPLETED, ERRORED, CANCELED): 30 days after endedAt
 * - Non-terminal states (QUEUED, RUNNING): no expiry yet
 */
export function getStorageExpiresAt(simulation: {
  status: string;
  createdAt: Date;
  endedAt: Date | null;
}): Date | null {
  if (simulation.status === "GENERATED") {
    const d = new Date(simulation.createdAt);
    d.setDate(d.getDate() + STORAGE_RETENTION_DAYS);
    return d;
  }

  if (
    simulation.status === "COMPLETED" ||
    simulation.status === "ERRORED" ||
    simulation.status === "CANCELED"
  ) {
    if (!simulation.endedAt) return null;
    const d = new Date(simulation.endedAt);
    d.setDate(d.getDate() + STORAGE_RETENTION_DAYS);
    return d;
  }

  // QUEUED / RUNNING — not yet expired
  return null;
}

@Injectable()
export class SimulationCleanupService {
  private readonly logger = new Logger(SimulationCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Runs every hour. Deletes simulation storage folders that are past their expiry date. */
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredSimulations() {
    const now = new Date();

    this.logger.log("Running storage cleanup check...");

    // Find all simulations in terminal states whose storage hasn't been deleted yet
    const simulations = await this.prisma.simulation.findMany({
      where: {
        status: { in: ["GENERATED", "COMPLETED", "ERRORED", "CANCELED"] },
        storageDeletedAt: null,
      },
      include: {
        user: { select: { username: true } },
      },
    });

    let deleted = 0;

    for (const sim of simulations) {
      const folder = join("/files", sim.user.username, sim.id);

      if (!existsSync(folder)) {
        // Folder is gone (deleted externally or never created) — record it regardless of expiry
        await this.prisma.simulation.update({
          where: { id: sim.id },
          data: { storageDeletedAt: now },
        });
        this.logger.log(
          `Storage folder for simulation ${sim.id} not found — marked as deleted.`,
        );
        continue;
      }

      const expiresAt = getStorageExpiresAt(sim);
      if (!expiresAt || now < expiresAt) continue;

      try {
        rmSync(folder, { recursive: true });
        await this.prisma.simulation.update({
          where: { id: sim.id },
          data: { storageDeletedAt: now },
        });
        this.logger.log(
          `Deleted storage for expired simulation ${sim.id} (user: ${sim.user.username})`,
        );
        deleted++;
      } catch (err) {
        this.logger.warn(
          `Failed to delete storage for simulation ${sim.id}: ${err}`,
        );
      }
    }

    if (deleted > 0) {
      this.logger.log(
        `Cleanup complete. Deleted storage for ${deleted} simulation(s).`,
      );
    } else {
      this.logger.log("Storage cleanup check complete. Nothing to delete.");
    }
  }
}
