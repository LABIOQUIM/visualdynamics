import { InjectQueue } from "@nestjs/bullmq";
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Job, Queue } from "bullmq";
import { existsSync, readFileSync } from "fs";

import { SIMULATION_TYPE } from "../generated/prisma/client.js";
import { SimulationUpdateInput } from "../generated/prisma/models.js";
import { PrismaService } from "../prisma.service.js";
import { getFilesRoot } from "../utils/filesRoot.js";
import { terminateProcess } from "../utils/process.js";
import { readFileData } from "../utils/readFileData.js";

import { getStorageExpiresAt } from "./simulation.cleanup.service.js";
import {
  buildImportedLigands,
  buildSimulationStoragePaths,
  getSimulationQueueState,
  parseSimulationProcessPid,
  readSimulationStoredArtifacts,
  withStorageExpiry,
} from "./simulation.service.helpers.js";
import type {
  QueuedSimulationDiagnostic,
  SimulationQueueDiagnostics,
  SimulationQueueDiagnosticsPagination,
  SimulationQueueJobSummary,
} from "./simulation.types.js";

const QUEUE_DIAGNOSTICS_PAGE_SIZE = 5;

function normalizeQueuePage(page: number | undefined) {
  return Number.isInteger(page) && page && page > 0 ? page : 0;
}

function getQueuePageBounds(page: number | undefined) {
  const normalizedPage = normalizeQueuePage(page);
  const start = normalizedPage * QUEUE_DIAGNOSTICS_PAGE_SIZE;

  return {
    start,
    end: start + QUEUE_DIAGNOSTICS_PAGE_SIZE - 1,
  };
}

function getSimulationIdFromJob(job: Job) {
  if (
    typeof job.data === "object" &&
    job.data !== null &&
    "simulationId" in job.data &&
    typeof job.data.simulationId === "string"
  ) {
    return job.data.simulationId;
  }

  return null;
}

function getUsernameFromJob(job: Job) {
  if (
    typeof job.data === "object" &&
    job.data !== null &&
    "user" in job.data &&
    typeof job.data.user === "object" &&
    job.data.user !== null &&
    "username" in job.data.user &&
    typeof job.data.user.username === "string"
  ) {
    return job.data.user.username;
  }

  return null;
}

async function mapQueueJob(job: Job): Promise<SimulationQueueJobSummary> {
  return {
    id: job.id,
    username: getUsernameFromJob(job),
    name: job.name,
    state: await job.getState(),
    simulationId: getSimulationIdFromJob(job),
    attemptsMade: job.attemptsMade,
    failedReason: job.failedReason ?? null,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
  };
}

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

    if (simulation.status === "RUNNING") {
      const pidFilePath = `/files/${simulation.user.username}/${simulationId}/processing.pid`;
      if (existsSync(pidFilePath)) {
        try {
          const pid = parseSimulationProcessPid(
            readFileSync(pidFilePath, "utf-8"),
          );
          if (pid !== null) {
            await terminateProcess(pid);
          }
        } catch {}
      }

      // Mark CANCELED before the killed process triggers onFailed.
      await this.prisma.simulation.update({
        where: { id: simulationId },
        data: { status: "CANCELED", endedAt: new Date() },
      });

      return { status: "canceled" };
    }

    // QUEUED jobs aren't locked — safe to remove.
    const jobs = await this.simulationQueue.getJobs([
      "waiting",
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

  async retrySimulation(simulationId: string) {
    const simulation = await this.prisma.simulation.findUnique({
      where: { id: simulationId },
      include: { user: true },
    });

    if (!simulation) {
      throw new NotFoundException("Simulation not found");
    }

    if (
      simulation.status !== "ERRORED" &&
      simulation.status !== "CANCELED"
    ) {
      throw new ConflictException(
        `Only errored or canceled simulations can be retried (current status: "${simulation.status}")`,
      );
    }

    await this.prisma.simulation.update({
      where: { id: simulationId },
      data: {
        status: "QUEUED",
        errorCause: null,
        endedAt: null,
        startedAt: null,
      },
    });

    await this.simulationQueue.add(
      "simulation",
      {
        simulationId: simulation.id,
        user: simulation.user,
        type: simulation.type,
        successEmail: "",
        errorEmail: "",
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
      },
    );

    return { status: "queued" };
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

  private async addQueueJobUsernames(jobs: SimulationQueueJobSummary[]) {
    const missingUsernameSimulationIds = jobs
      .filter((job) => !job.username)
      .map((job) => job.simulationId)
      .filter((simulationId): simulationId is string => typeof simulationId === "string");

    if (missingUsernameSimulationIds.length === 0) {
      return jobs;
    }

    const simulations = await this.prisma.simulation.findMany({
      where: {
        id: {
          in: missingUsernameSimulationIds,
        },
      },
      select: {
        id: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    const usernamesBySimulationId = new Map(
      simulations.map((simulation) => [simulation.id, simulation.user.username]),
    );

    return jobs.map((job) => ({
      ...job,
      username:
        job.username ??
        (job.simulationId ? (usernamesBySimulationId.get(job.simulationId) ?? null) : null),
    }));
  }

  async getQueueDiagnostics(
    pagination: SimulationQueueDiagnosticsPagination = {},
  ): Promise<SimulationQueueDiagnostics> {
    const waitingPage = getQueuePageBounds(pagination.waitingPage);
    const activePage = getQueuePageBounds(pagination.activePage);
    const failedPage = getQueuePageBounds(pagination.failedPage);
    const queuedPage = getQueuePageBounds(pagination.queuedPage);

    const [
      counts,
      paused,
      workerCount,
      waitingJobs,
      activeJobs,
      failedJobs,
      queuedSimulations,
      queuedSimulationsTotal,
      jobsForQueuedSimulationState,
    ] = await Promise.all([
      this.simulationQueue.getJobCounts(),
      this.simulationQueue.isPaused(),
      this.simulationQueue.getWorkersCount(),
      this.simulationQueue.getJobs("waiting", waitingPage.start, waitingPage.end, false),
      this.simulationQueue.getJobs("active", activePage.start, activePage.end, false),
      this.simulationQueue.getJobs("failed", failedPage.start, failedPage.end, false),
      this.prisma.simulation.findMany({
        where: { status: "QUEUED" },
        orderBy: { createdAt: "desc" },
        skip: queuedPage.start,
        take: QUEUE_DIAGNOSTICS_PAGE_SIZE,
        select: {
          id: true,
          moleculeName: true,
          type: true,
          errorCause: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              username: true,
            },
          },
        },
      }),
      this.prisma.simulation.count({
        where: { status: "QUEUED" },
      }),
      this.simulationQueue.getJobs(["active", "delayed", "failed", "paused", "waiting"]),
    ]);

    const [mappedWaitingJobs, mappedActiveJobs, mappedFailedJobs] = await Promise.all([
      Promise.all(waitingJobs.map((job) => mapQueueJob(job))).then((jobs) =>
        this.addQueueJobUsernames(jobs),
      ),
      Promise.all(activeJobs.map((job) => mapQueueJob(job))).then((jobs) =>
        this.addQueueJobUsernames(jobs),
      ),
      Promise.all(failedJobs.map((job) => mapQueueJob(job))).then((jobs) =>
        this.addQueueJobUsernames(jobs),
      ),
    ]);

    const jobsBySimulationId = new Map(
      jobsForQueuedSimulationState
        .map((job) => [getSimulationIdFromJob(job), job] as const)
        .filter((entry): entry is readonly [string, Job] => typeof entry[0] === "string"),
    );

    return {
      counts,
      paused,
      workerCount,
      recentJobs: {
        waiting: {
          records: mappedWaitingJobs,
          total: counts.waiting ?? 0,
        },
        active: {
          records: mappedActiveJobs,
          total: counts.active ?? 0,
        },
        failed: {
          records: mappedFailedJobs,
          total: counts.failed ?? 0,
        },
      },
      queuedSimulations: {
        records: await Promise.all(
          queuedSimulations.map(async (simulation): Promise<QueuedSimulationDiagnostic> => {
            const queueJob = jobsBySimulationId.get(simulation.id);

            return {
              id: simulation.id,
              username: simulation.user.username,
              moleculeName: simulation.moleculeName,
              type: simulation.type,
              jobId: queueJob?.id ? String(queueJob.id) : null,
              redisState: queueJob?.id ? await queueJob.getState() : null,
              errorCause: simulation.errorCause,
              createdAt: simulation.createdAt,
              updatedAt: simulation.updatedAt,
            };
          }),
        ),
        total: queuedSimulationsTotal,
      },
    };
  }

  async getQueueInfo() {
    const active = await this.simulationQueue.getActiveCount();
    const failed = await this.simulationQueue.getFailedCount();
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
