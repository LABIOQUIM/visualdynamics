import { InjectQueue } from "@nestjs/bullmq";
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { Queue, QueueEvents } from "bullmq";

import { PrismaClient } from "../generated/prisma/client.js";

const user = process.env.DB_USER;
const pass = process.env.DB_PASS;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const name = process.env.DB_DATABASE;

const connectionString = `postgresql://${user}:${pass}@${host}:${port}/${name}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

@Injectable()
export class SimulationEventsListener implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SimulationEventsListener.name);
  private queueEvents!: QueueEvents;

  constructor(
    @InjectQueue("simulation") private readonly simulationQueue: Queue,
  ) {}

  onModuleInit() {
    const connection = {
      host: process.env.REDIS_HOST ?? "redis",
      port: Number(process.env.REDIS_PORT ?? 6379),
    };

    this.queueEvents = new QueueEvents(this.simulationQueue.name, {
      connection,
    });

    this.queueEvents.on("error", (error) => {
      this.logger.error(
        'QueueEvents connection error for the "simulation" queue',
        error instanceof Error ? error.stack : String(error),
      );
    });

    this.queueEvents.on("waiting", ({ jobId }) => this.onWaiting(jobId));
    this.queueEvents.on("active", ({ jobId }) => this.onActive(jobId));
    this.queueEvents.on("completed", ({ jobId }) => this.onCompleted(jobId));
    this.queueEvents.on("failed", ({ jobId, failedReason }) =>
      this.onFailed(jobId, failedReason),
    );

    this.logger.log(
      'QueueEvents listener initialized for the "simulation" queue.',
    );
  }

  async onModuleDestroy() {
    await this.queueEvents.close();
  }

  private async onActive(jobId: string) {
    this.logger.log(`Job ${jobId} is active. Running pre-steps...`);
    const job = await this.simulationQueue.getJob(jobId);
    if (!job) return;

    try {
      await prisma.simulation.update({
        where: { id: job.data.simulationId },
        data: { status: "RUNNING", startedAt: new Date() },
      });
    } catch (error) {
      this.logger.error(
        `Failed during pre-step setup for job ${job.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      await job.moveToFailed(
        error instanceof Error ? error : new Error(String(error)),
        job.token!,
      );
    }
  }

  private async onWaiting(jobId: string) {
    try {
      this.logger.debug(`Job ${jobId} is waiting. Checking for stalled job...`);
      const job = await this.simulationQueue.getJob(jobId);
      if (!job) return;

      // Guard against the waiting→active race: if BullMQ has already
      // transitioned the job to active (or beyond), onActive will handle
      // the DB update; skip here to avoid incorrectly resetting a live job.
      const jobState = await job.getState();
      if (jobState !== "waiting" && jobState !== "delayed") {
        this.logger.debug(
          `Job ${jobId} waiting event skipped — job is already in state "${jobState}".`,
        );
        return;
      }

      const { simulationId } = job.data;

      // Only update to QUEUED if the simulation is currently RUNNING.
      // This handles the case where the server restarted and BullMQ re-queued a
      // stalled job. For new submissions, the status is already set to QUEUED
      // synchronously in addSimulationToQueue before the job is enqueued, so
      // this will be a no-op.
      const { count } = await prisma.simulation.updateMany({
        where: {
          id: simulationId,
          status: "RUNNING",
        },
        data: {
          status: "QUEUED",
          startedAt: null,
          endedAt: null,
          errorCause: null,
        },
      });

      if (count > 0) {
        this.logger.log(
          `Job ${jobId} was stalled and re-queued. Reset status to QUEUED.`,
        );
      } else {
        this.logger.debug(
          `Job ${jobId} waiting event was a no-op (not in RUNNING state).`,
        );
      }
    } catch (error) {
      const errorStackOrMessage =
        error instanceof Error ? error.stack : String(error);
      this.logger.error(
        `Error handling waiting event for job ${jobId}`,
        errorStackOrMessage,
      );
    }
  }

  private async onCompleted(jobId: string) {
    this.logger.log(`Job ${jobId} completed. Running post-steps...`);
    const job = await this.simulationQueue.getJob(jobId);
    if (!job) return;

    const { simulationId } = job.data;

    await prisma.simulation.update({
      where: {
        id: simulationId,
      },
      data: {
        endedAt: new Date(),
        status: "COMPLETED",
      },
    });
  }

  private async onFailed(jobId: string, failedReason: string) {
    this.logger.error(`Job ${jobId} failed. Reason: ${failedReason}`);
    const job = await this.simulationQueue.getJob(jobId);
    if (!job) return;

    // Do not overwrite a CANCELED status — the job may have been killed as
    // part of an intentional cancellation and BullMQ fires "failed" afterward.
    const { count } = await prisma.simulation.updateMany({
      where: {
        id: job.data.simulationId,
        status: { not: "CANCELED" },
      },
      data: {
        status: "ERRORED",
        endedAt: new Date(),
        errorCause: failedReason,
      },
    });

    if (count === 0) {
      this.logger.debug(
        `Job ${jobId} failed event skipped — simulation is already CANCELED.`,
      );
    }
  }
}
