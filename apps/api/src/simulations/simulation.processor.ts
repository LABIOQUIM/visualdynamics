// This file runs in a completely separate process.
// It cannot use NestJS dependency injection.

import { Job } from "bullmq";
import { prisma } from "database"; // Make sure Prisma can be initialized independently.
import { writeFileSync } from "fs";
import * as path from "path";
import { chdir } from "process";

import { executeCommands } from "../utils/executeCommands"; // Adjust path if needed
import { loadCommands } from "../utils/loadCommands"; // Adjust path if needed

import { SimulateData } from "./simulation.types";

// The default export is an async function that BullMQ will execute.
export default async function (job: Job<SimulateData>): Promise<string> {
  // Use console.log for debugging in the sandboxed process.
  console.log(`[Sandboxed Process ${process.pid}] Starting job ${job.id}`);

  try {
    const {
      type,
      user: { userName },
    } = job.data;

    const folder = path.resolve(`/files/${userName}/${type.toLowerCase()}`);
    const folderRun = path.resolve(folder, "run");
    const fileLogPath = path.resolve(folderRun, "logs", "gmx.log");
    const fileStepPath = path.resolve(folder, "steps.txt");

    const commands = await loadCommands(folder);

    // Change directory to the correct run folder
    chdir(folderRun);
    writeFileSync(fileStepPath, ""); // Clear/create the steps file
    await executeCommands(commands, fileStepPath, fileLogPath);

    console.log(`[Sandboxed Process ${process.pid}] Finished job ${job.id}`);

    // The return value signals success and is passed to the 'completed' event listener.
    return `${job.data.simulationId} done!`;
  } catch (e) {
    console.error(
      `[Sandboxed Process ${process.pid}] Job ${job.id} failed:`,
      e
    );
    // Throwing an error marks the job as failed and triggers the 'failed' event listener.
    throw new Error(
      e?.message || `Job ${job.data.simulationId} failed to run command!`
    );
  } finally {
    // IMPORTANT: Disconnect Prisma to allow the sandboxed process to exit cleanly.
    await prisma.$disconnect();
  }
}
