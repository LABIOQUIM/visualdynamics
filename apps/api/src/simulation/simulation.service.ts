import { InjectQueue } from "@nestjs/bullmq";
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Queue } from "bullmq";
import { existsSync, readFileSync } from "fs";

import { SIMULATION_TYPE } from "../generated/prisma/client.js";
import { SimulationUpdateInput } from "../generated/prisma/models.js";
import { PrismaService } from "../prisma.service.js";
import { getFilesRoot } from "../utils/filesRoot.js";
import { readFileData } from "../utils/readFileData.js";

import { getStorageExpiresAt } from "./simulation.cleanup.service.js";
import {
  buildImportedLigands,
  buildSimulationStoragePaths,
  getSimulationQueueState,
  parseSimulationProcessPid,
  readSimulationStoredArtifacts,
  terminateSimulationProcess,
  withStorageExpiry,
} from "./simulation.service.helpers.js";

const simulationDetailsSelect = {
  id: true,
  errorCause: true,
  createdAt: true,
  moleculeName: true,
  startedAt: true,
  endedAt: true,
  status: true,
  type: true,
  storageDeletedAt: true,
  ligands: {
    select: {
      ligandITPName: true,
      ligandPDBName: true,
      position: true,
    },
    orderBy: { position: "asc" },
  },
  user: {
    select: {
      username: true,
    },
  },
} as const;

@Injectable()
export class SimulationService {
  constructor(
    @InjectQueue("simulation") private simulationQueue: Queue,
    private prisma: PrismaService,
  ) {}

  protected getSimulationStoragePaths(username: string, simulationId: string) {
    return buildSimulationStoragePaths(getFilesRoot(), username, simulationId);
  }

  protected pathExists(path: string) {
    return existsSync(path);
  }

  protected readStoredFile(path: string, preserveWhitespace: boolean) {
    return readFileData(path, preserveWhitespace);
  }

  private async getReadableSimulation(
    simulationId: string,
    requestUsername: string,
    isAdmin: boolean,
  ) {
    const simulation = await this.prisma.simulation.findFirst({
      where: {
        id: simulationId,
      },
      select: simulationDetailsSelect,
    });

    if (!simulation) {
      return null;
    }

    if (!isAdmin && simulation.user.username !== requestUsername) {
      throw new UnauthorizedException("Unauthorized");
    }

    return simulation;
  }

  async getSimulationOwnerUsername(
    simulationId: string,
    requestUsername: string,
    isAdmin: boolean,
  ) {
    const simulation = await this.getReadableSimulation(
      simulationId,
      requestUsername,
      isAdmin,
    );

    return simulation?.user.username ?? null;
  }

  async getSimulationDetails(
    requestUsername: string,
    isAdmin: boolean,
    simulationId: string,
  ) {
    const simulation = await this.getReadableSimulation(
      simulationId,
      requestUsername,
      isAdmin,
    );

    if (!simulation) {
      return null;
    }

    const jobs = await this.simulationQueue.getJobs();
    const waitingJobs = await this.simulationQueue.getJobs(["waiting"]);
    const activeJobs = await this.simulationQueue.getJobs(["active"]);
    const { jobId, queuePosition, isActive } = getSimulationQueueState(
      simulationId,
      jobs,
      waitingJobs,
      activeJobs,
    );

    const storagePaths = this.getSimulationStoragePaths(
      simulation.user.username,
      simulationId,
    );
    const { isStored, stepData, logData, molecules } =
      readSimulationStoredArtifacts(
        storagePaths,
        simulation.ligands ?? [],
        (path) => this.pathExists(path),
        (path, preserveWhitespace) =>
          this.readStoredFile(path, preserveWhitespace),
      );

    return {
      isActive,
      isStored,
      queuePosition,
      jobId,
      stepData,
      logData,
      simulation: withStorageExpiry(simulation, getStorageExpiresAt),
      molecules,
    };
  }

  async getUserSimulations(id: string, pageSize: number, page: number) {
    const [records, total] = await this.prisma.$transaction([
      this.prisma.simulation.findMany({
        where: {
          userId: id,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: page * pageSize,
        take: pageSize,
      }),
      this.prisma.simulation.count({
        where: {
          userId: id,
        },
      }),
    ]);

    return {
      records: records.map((r) => withStorageExpiry(r, getStorageExpiresAt)),
      total,
    };
  }

  async getMgmtSimulations(id: string, pageSize: number, page: number) {
    const [records, total] = await this.prisma.$transaction([
      this.prisma.simulation.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
        skip: page * pageSize,
        take: pageSize,
      }),
      this.prisma.simulation.count(),
    ]);

    return {
      records: records.map((r) => withStorageExpiry(r, getStorageExpiresAt)),
      total,
    };
  }

  async cancelSimulation(
    simulationId: string,
    requestUserId: string,
    isAdmin: boolean,
  ) {
    const simulation = await this.prisma.simulation.findUnique({
      where: { id: simulationId },
      include: { user: true },
    });

    if (!simulation) {
      throw new NotFoundException("Simulation not found");
    }

    if (!isAdmin && simulation.userId !== requestUserId) {
      throw new UnauthorizedException("Unauthorized");
    }

    if (simulation.status !== "QUEUED" && simulation.status !== "RUNNING") {
      throw new ConflictException(
        `Simulation cannot be canceled in status "${simulation.status}"`,
      );
    }

    // If the job is running, kill the sandboxed processor process.
    if (simulation.status === "RUNNING") {
      const pidFilePath = `/files/${simulation.user.username}/${simulationId}/processing.pid`;
      if (existsSync(pidFilePath)) {
        try {
          const pid = parseSimulationProcessPid(
            readFileSync(pidFilePath, "utf-8"),
          );
          if (pid !== null) {
            terminateSimulationProcess(
              pid,
              process.pid,
              (targetPid) => readFileSync(`/proc/${targetPid}/stat`, "utf-8"),
              (targetPid, signal) => process.kill(targetPid, signal),
            );
          }
        } catch {
          // PID file unreadable or process already gone — proceed to DB update.
        }
      }
    }

    // Remove the job from the BullMQ queue (no-op if it was already processed).
    const jobs = await this.simulationQueue.getJobs([
      "waiting",
      "active",
      "delayed",
    ]);
    const job = jobs.find((j) => j.data.simulationId === simulationId);
    if (job) {
      await job.remove();
    }

    await this.prisma.simulation.update({
      where: { id: simulationId },
      data: { status: "CANCELED", endedAt: new Date() },
    });

    return { status: "canceled" };
  }

  async adminUpdateSimulation(id: string, body: SimulationUpdateInput) {
    const { id: _id, ...data } = body;

    await this.prisma.simulation.update({
      where: { id },
      data,
    });
  }

  async adminImportSimulations(
    rows: Array<{
      id?: string;
      user_name: string;
      molecule_name: string;
      type: string;
      status: string;
      started_at?: string;
      ended_at?: string;
      error_cause?: string;
      created_at?: string;
      updated_at?: string;
      ligand_itp_name?: string;
      ligand_pdb_name?: string;
    }>,
  ) {
    let imported = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        const user = await this.prisma.user.findFirst({
          where: { username: row.user_name },
          select: { id: true },
        });

        if (!user) {
          errors.push(`User not found: ${row.user_name}`);
          continue;
        }

        const existing = row.id
          ? await this.prisma.simulation.findFirst({ where: { id: row.id } })
          : null;

        if (existing) {
          errors.push(`Simulation already exists: ${row.id}`);
          continue;
        }

        const ligands = buildImportedLigands(row);

        await this.prisma.simulation.create({
          data: {
            ...(row.id ? { id: row.id } : {}),
            userId: user.id,
            moleculeName: row.molecule_name,
            type: row.type as SIMULATION_TYPE,
            status: row.status as any,
            startedAt: row.started_at ? new Date(row.started_at) : null,
            endedAt: row.ended_at ? new Date(row.ended_at) : null,
            errorCause: row.error_cause ?? null,
            createdAt: row.created_at ? new Date(row.created_at) : new Date(),
            ...(ligands.length ? { ligands: { create: ligands } } : {}),
          },
        });

        imported++;
      } catch (err) {
        errors.push(
          `Row ${row.id ?? row.molecule_name}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    return { imported, errors };
  }

  async getQueueInfo() {
    const active = await this.simulationQueue.getActiveCount();
    const failed = await this.simulationQueue.getFailedCount();
    // const paused = await this.simulationQueue.getPausedCount();
    const paused = 0;
    const delayed = await this.simulationQueue.getDelayedCount();
    const waiting = await this.simulationQueue.getWaitingCount();
    const completed = await this.simulationQueue.getCompletedCount();

    const jobs = await this.simulationQueue.getJobs([
      "active",
      "completed",
      "delayed",
      "failed",
      "paused",
      "waiting",
    ]);

    return { active, failed, paused, delayed, waiting, completed, jobs };
  }
}
