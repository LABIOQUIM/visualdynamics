// This file runs in a completely separate process.
// It cannot use NestJS dependency injection.

import { PrismaPg } from "@prisma/adapter-pg";
import { Job } from "bullmq";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import * as path from "path";
import { chdir } from "process";

import { PrismaClient } from "../generated/prisma/client";
import { executeCommands } from "../utils/executeCommands"; // Adjust path if needed
import { loadCommands } from "../utils/loadCommands"; // Adjust path if needed

import { SimulateData } from "./simulation.types";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function terminateProcess(pid: number): Promise<void> {
  try {
    process.kill(pid, "SIGTERM");
    // Give the process up to 5 s to shut down gracefully before force-killing it.
    const deadline = Date.now() + 5000;
    while (isProcessRunning(pid) && Date.now() < deadline) {
      await new Promise<void>((r) => setTimeout(r, 100));
    }
    if (isProcessRunning(pid)) {
      process.kill(pid, "SIGKILL");
    }
  } catch {
    // Process may have already exited between the check and the kill.
  }
}

// The default export is an async function that BullMQ will execute.
export default async function (job: Job<SimulateData>): Promise<string> {
  // Use console.log for debugging in the sandboxed process.
  console.log(`[Sandboxed Process ${process.pid}] Starting job ${job.id}`);

  const {
    user: { username },
    simulationId,
  } = job.data;

  const folder = path.resolve(`/files/${username}/${simulationId}`);
  const folderRun = path.resolve(folder, "run");
  const fileLogPath = path.resolve(folderRun, "logs", "gmx.log");
  const fileStepPath = path.resolve(folder, "steps.txt");
  const pidFilePath = path.resolve(folder, "processing.pid");

  try {
    // When the API restarts, a previously active sandboxed process becomes an
    // orphan (its IPC channel to the Worker is severed). BullMQ will eventually
    // detect the job as stalled and re-queue it, spawning this new process.
    // To avoid two processes writing to the same files simultaneously, we check
    // for a PID file left by the previous run and terminate that process first.
    if (existsSync(pidFilePath)) {
      const rawPid = readFileSync(pidFilePath, "utf-8").trim();
      const existingPid = parseInt(rawPid, 10);
      if (isNaN(existingPid)) {
        console.warn(
          `[Sandboxed Process ${process.pid}] PID file contained non-numeric data: "${rawPid}" — ignoring`,
        );
      } else if (existingPid !== process.pid && isProcessRunning(existingPid)) {
        await terminateProcess(existingPid);
        console.log(
          `[Sandboxed Process ${process.pid}] Terminated orphaned process ${existingPid} for simulation ${simulationId}`,
        );
      }
    }

    writeFileSync(pidFilePath, String(process.pid));

    const commands = await loadCommands(folder);

    // Change directory to the correct run folder
    chdir(folderRun);
    writeFileSync(fileStepPath, ""); // Clear/create the steps file
    await executeCommands(commands, fileStepPath, fileLogPath);

    console.log(`[Sandboxed Process ${process.pid}] Finished job ${job.id}`);

    // The return value signals success and is passed to the 'completed' event listener.
    return `${simulationId} done!`;
  } catch (e) {
    console.error(
      `[Sandboxed Process ${process.pid}] Job ${job.id} failed:`,
      e,
    );
    // Throwing an error marks the job as failed and triggers the 'failed' event listener.
    throw new Error(
      e?.message || `Job ${job.data.simulationId} failed to run command!`,
    );
  } finally {
    // Remove the PID file so a clean next run doesn't see a stale entry.
    if (existsSync(pidFilePath)) {
      try {
        unlinkSync(pidFilePath);
      } catch {
        // Best-effort cleanup.
      }
    }
    // IMPORTANT: Disconnect Prisma to allow the sandboxed process to exit cleanly.
    await prisma.$disconnect();
  }
}
