import { InjectQueue } from "@nestjs/bullmq";
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import axios from "axios";
import { Queue, QueueEvents } from "bullmq";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import * as path from "node:path";

import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
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
      const queuedFilePath = `/files/${job.data.user.userName}/queued`;
      const runningFilePath = `/files/${job.data.user.userName}/running`;
      if (existsSync(queuedFilePath)) rmSync(queuedFilePath);
      writeFileSync(runningFilePath, job.data.type);
    } catch (error) {
      this.logger.error(
        `Failed during pre-step setup for job ${job.id}`,
        error.stack,
      );
      await job.moveToFailed(error, job.token);
    }
  }

  private async onCompleted(jobId: string) {
    this.logger.log(`Job ${jobId} completed. Running post-steps...`);
    const job = await this.simulationQueue.getJob(jobId);
    if (!job) return null;

    const {
      type,
      user: { userName },
    } = job.data;

    const folder = path.resolve(`/files/${userName}/${type.toLowerCase()}`);

    const fileEndedPath = path.resolve(folder, "ended");

    await prisma.simulation.update({
      where: {
        id: job.data.simulationId,
      },
      data: {
        endedAt: new Date(),
        status: "COMPLETED",
      },
    });

    writeFileSync(fileEndedPath, "ended");
    rmSync(`/files/${userName}/running`);
    await axios.post("http://mailer:3000/send-email", {
      from: `LABIOQUIM <${process.env.SMTP_USER}>`,
      to: job.data.user.email,
      subject: "[LABIOQUIM] About your simulation",
      html: job.data.successEmail,
    });
  }

  private async onFailed(jobId: string, failedReason: string) {
    this.logger.error(`Job ${jobId} failed. Reason: ${failedReason}`);
    const job = await this.simulationQueue.getJob(jobId);
    if (!job) return;

    console.log(failedReason);

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
    rmSync(`/files/${job.data.user.userName}/running`);
    await axios.post("http://mailer:3000/send-email", {
      from: `LABIOQUIM <${process.env.SMTP_USER}>`,
      to: job.data.user.email,
      subject: "[LABIOQUIM] About your simulation",
      html: job.data.errorEmail,
    });
  }
}
