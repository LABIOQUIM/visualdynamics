import { InjectQueue } from "@nestjs/bullmq";
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { Queue, QueueEvents } from "bullmq";

import { PrismaClient } from "../generated/prisma/client";

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
  private queueEvents: QueueEvents;

  // Inject the queue to get connection options and fetch job data.
  constructor(
    @InjectQueue("simulation") private readonly simulationQueue: Queue,
  ) {}

  // onModuleInit is the NestJS hook to start the listener when the app starts.
  onModuleInit() {
    // Manually create a QueueEvents instance.
    // It uses the same connection options as the queue.
    this.queueEvents = new QueueEvents(this.simulationQueue.name, {
      connection: this.simulationQueue.opts.connection,
    });

    // Subscribe to the events.
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

  // onModuleDestroy is the NestJS hook to clean up when the app shuts down.
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
        error.stack,
      );
      await job.moveToFailed(error, job.token);
    }
  }

  private async onWaiting(jobId: string) {
    this.logger.log(`Job ${jobId} is waiting. Updating status to QUEUED...`);
    const job = await this.simulationQueue.getJob(jobId);
    if (!job) return;

    const { simulationId } = job.data;

    await prisma.simulation.updateMany({
      where: {
        id: simulationId,
        status: { notIn: ["RUNNING", "COMPLETED", "ERRORED"] },
      },
      data: {
        status: "QUEUED",
        startedAt: null,
        endedAt: null,
      },
    });
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

    await prisma.simulation.update({
      where: {
        id: job.data.simulationId,
      },
      data: {
        status: "ERRORED",
        endedAt: new Date(),
        errorCause: failedReason,
      },
    });
  }
}
