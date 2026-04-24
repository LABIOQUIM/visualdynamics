import { InjectQueue } from "@nestjs/bullmq";
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Queue } from "bullmq";
import { existsSync, readFileSync } from "fs";

import { SIMULATION_TYPE } from "../generated/prisma/client";
import { SimulationUpdateInput } from "../generated/prisma/models";
import { PrismaService } from "../prisma.service";
import { readFileData } from "../utils/readFileData";

import { getStorageExpiresAt } from "./simulation.cleanup.service";

@Injectable()
export class SimulationService {
  constructor(
    @InjectQueue("simulation") private simulationQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async getSimulationDetails(username: string, simulationId: string) {
    const userFolderPath = `/files/${username}`;
    const jobs = await this.simulationQueue.getJobs();
    const waitingJobs = await this.simulationQueue.getJobs(["waiting"]);
    const activeJobs = await this.simulationQueue.getJobs(["active"]);

    // Get Job ID
    let jobId = "-1";

    const jobIndex = jobs.findIndex(
      (job) => job.data.simulationId === simulationId,
    );

    if (jobIndex !== -1) {
      jobId = jobs[jobIndex].id ?? "-1";
    }

    // Get Job Queue Position
    let queuePosition = -1;

    const waitingJobIndex = waitingJobs.findIndex(
      (job) => job.data.simulationId === simulationId,
    );

    if (waitingJobIndex !== -1) {
      queuePosition = waitingJobs.length - waitingJobIndex;
    }

    // Get Job Status
    let isActive = false;

    const activeJobIndex = activeJobs.findIndex(
      (job) => job.data.simulationId === simulationId,
    );

    if (activeJobIndex !== -1) {
      isActive = true;
    }

    const simulationFolderPath = `${userFolderPath}/${simulationId}`;
    const logFilePath = `${simulationFolderPath}/run/logs/gmx.log`;
    const molFilePath = `${simulationFolderPath}/run/originalMacromolecule.pdb`;
    const stepFilePath = `${simulationFolderPath}/steps.txt`;

    let isStored = false;

    if (existsSync(simulationFolderPath)) {
      isStored = true;
    }

    let stepData: string[] = [];
    let logData: string[] = [];

    if (existsSync(stepFilePath)) {
      stepData = readFileData(stepFilePath, false);
    }

    if (existsSync(logFilePath)) {
      logData = readFileData(logFilePath, true);
    }

    let macromolecule: string | null = null;

    if (existsSync(molFilePath)) {
      macromolecule = readFileData(molFilePath, false).join("\n");
    }

    const simulation = await this.prisma.simulation.findFirst({
      where: {
        id: simulationId,
      },
      select: {
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
      },
    });

    // Read all canonical ligand PDB files ordered by position
    const ligandPdbContents: string[] = [];
    const ligandRecords = simulation?.ligands ?? [];

    for (const ligandRecord of ligandRecords) {
      const canonicalPath = `${simulationFolderPath}/run/originalLigand_${ligandRecord.position}.pdb`;
      // Backward-compat: fall back to originalLigand.pdb for the first ligand
      const fallbackPath = `${simulationFolderPath}/run/originalLigand.pdb`;
      if (existsSync(canonicalPath)) {
        ligandPdbContents.push(readFileData(canonicalPath, false).join("\n"));
      } else if (ligandRecord.position === 0 && existsSync(fallbackPath)) {
        ligandPdbContents.push(readFileData(fallbackPath, false).join("\n"));
      }
    }

    const molecules = {
      macromolecule,
      ligands: ligandPdbContents,
    };

    return {
      isActive,
      isStored,
      queuePosition,
      jobId,
      stepData,
      logData,
      simulation: simulation
        ? { ...simulation, storageExpiresAt: getStorageExpiresAt(simulation) }
        : null,
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
      records: records.map((r) => ({
        ...r,
        storageExpiresAt: getStorageExpiresAt(r),
      })),
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
      records: records.map((r) => ({
        ...r,
        storageExpiresAt: getStorageExpiresAt(r),
      })),
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
          const raw = readFileSync(pidFilePath, "utf-8").trim();
          const colonIdx = raw.indexOf(":");
          const pidStr = colonIdx >= 0 ? raw.slice(0, colonIdx) : raw;
          const pid = parseInt(pidStr, 10);
          if (Number.isSafeInteger(pid) && pid > 0) {
            // Try to signal the process group; fall back to single-PID kill.
            const pgidRaw = readFileSync(`/proc/${pid}/stat`, "utf-8");
            const afterComm = pgidRaw.slice(pgidRaw.lastIndexOf(")") + 2);
            const pgid = parseInt(afterComm.split(" ")[2], 10);
            const ownStat = readFileSync(`/proc/${process.pid}/stat`, "utf-8");
            const ownAfterComm = ownStat.slice(ownStat.lastIndexOf(")") + 2);
            const ownPgid = parseInt(ownAfterComm.split(" ")[2], 10);
            if (Number.isSafeInteger(pgid) && pgid > 0 && pgid !== ownPgid) {
              try {
                process.kill(-pgid, "SIGTERM");
              } catch {
                process.kill(pid, "SIGTERM");
              }
            } else {
              process.kill(pid, "SIGTERM");
            }
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

        const ligands =
          row.ligand_itp_name && row.ligand_pdb_name
            ? [
                {
                  ligandITPName: row.ligand_itp_name,
                  ligandPDBName: row.ligand_pdb_name,
                  position: 0,
                },
              ]
            : [];

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
