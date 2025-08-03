import axios from "axios";
import { DoneCallback, Job } from "bull";
import { prisma } from "database";
import { existsSync, rmSync, writeFileSync } from "fs";
import * as path from "path";
import { chdir } from "process";
import { executeCommands } from "src/utils/executeCommands";
import { loadCommands } from "src/utils/loadCommands";
import { setTimeout } from "timers/promises";

import { SimulateData } from "./simulation.types";

async function onError(job: Job<SimulateData>, error: Error): Promise<void> {
  console.log(`Error in job: ${job.id}. Error: ${error.message}`);
  await prisma.simulation.update({
    where: {
      id: job.data.simulationId,
    },
    data: {
      status: "ERRORED",
      endedAt: new Date(),
      errorCause: error.message,
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

export default async function (job: Job<SimulateData>, cb: DoneCallback) {
  console.log(`Processing job ${job.id}...`);
  await setTimeout(5000);

  try {
    console.log(`Processing pre-steps for job ${job.id}...`);
    await prisma.simulation.update({
      where: {
        id: job.data.simulationId,
      },
      data: {
        status: "RUNNING",
        startedAt: new Date(),
      },
    });
    const queuedFilePath = `/files/${job.data.user.userName}/queued`;
    const runningFilePath = `/files/${job.data.user.userName}/running`;
    if (existsSync(queuedFilePath)) {
      rmSync(queuedFilePath);
    }
    writeFileSync(runningFilePath, job.data.type);
  } catch {
    await onError(job, new Error("Failed to Setup!"));
    cb(new Error(`${job.data.simulationId} failed to setup!`));
    return;
  }

  try {
    console.log(`Processing commands for job ${job.id}...`);
    const {
      type,
      user: { userName },
    } = job.data;

    const folder = path.resolve(`/files/${userName}/${type.toLowerCase()}`);

    const folderRun = path.resolve(folder, "run");
    const fileLogPath = path.resolve(folderRun, "logs", "gmx.log");
    const fileStepPath = path.resolve(folder, "steps.txt");

    const commands = await loadCommands(folder);

    chdir(folderRun);
    writeFileSync(fileStepPath, "");
    await executeCommands(commands, fileStepPath, fileLogPath);
  } catch (e) {
    await onError(job, new Error(e?.message));
    cb(new Error(`${job.data.simulationId} failed to run command!`));
    return;
  }

  try {
    console.log(`Processing post-steps for job ${job.id}...`);
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
  } catch {
    await onError(job, new Error("Failed on post-steps"));
    cb(new Error(`${job.data.simulationId} failed on post-steps!`));
    return;
  }

  cb(null, `${job.data.simulationId} done!`);
}
