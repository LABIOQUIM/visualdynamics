// This file runs in a completely separate process.
// It cannot use NestJS dependency injection.

import { PrismaPg } from "@prisma/adapter-pg";
import { Job } from "bullmq";
import {
  existsSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import * as path from "path";
import { chdir } from "process";

import { PrismaClient } from "../generated/prisma/client";
import { executeCommands } from "../utils/executeCommands"; // Adjust path if needed
import { loadCommands } from "../utils/loadCommands"; // Adjust path if needed

import { SimulateData } from "./simulation.types";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * Reads the start time (field 22) from /proc/<pid>/stat. This value is unique
 * per process incarnation and is used to detect PID reuse: if the start time in
 * the lock file doesn't match the running process, the PID belongs to an
 * unrelated process and we must NOT kill it.
 * Returns null when the file cannot be read (process gone or non-Linux env).
 */
function readProcessStartTime(pid: number): string | null {
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, "utf-8");
    // The comm field (field 2) is wrapped in parens and can itself contain
    // spaces/parens. Parse everything after the LAST ')' to reach the rest.
    const afterComm = stat.slice(stat.lastIndexOf(")") + 2);
    // After ')': state(0) ppid(1) pgrp(2) … starttime(19) — 0-indexed
    return afterComm.split(" ")[19] ?? null;
  } catch {
    return null;
  }
}

/**
 * Reads the process group ID of `pid` from /proc/<pid>/stat (pgrp, field 5).
 * Returns null when the file cannot be read.
 */
function readProcessGroupId(pid: number): number | null {
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, "utf-8");
    const afterComm = stat.slice(stat.lastIndexOf(")") + 2);
    // After ')': state(0) ppid(1) pgrp(2) — 0-indexed
    const pgid = parseInt(afterComm.split(" ")[2], 10);
    return Number.isSafeInteger(pgid) && pgid > 0 ? pgid : null;
  } catch {
    return null;
  }
}

function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sends SIGTERM to the process group of `pid` (which also reaches any GROMACS
 * child processes), falling back to a single-process kill if group-signaling
 * fails. Escalates to SIGKILL if the process hasn't exited within 5 s.
 * Returns true when the process is no longer running, false otherwise.
 */
async function terminateProcess(pid: number): Promise<boolean> {
  // Read the actual PGID from /proc so we target the correct process group
  // even when `pid` is not the process group leader.
  const pgid = readProcessGroupId(pid);

  const killTarget = (sig: NodeJS.Signals) => {
    if (pgid !== null) {
      // Negative PGID signals the whole process group, terminating GROMACS
      // child processes alongside the sandboxed Node process.
      try {
        process.kill(-pgid, sig);
        return;
      } catch {
        // Fall through to single-process kill.
      }
    }
    try {
      process.kill(pid, sig);
    } catch {
      // Process already gone.
    }
  };

  killTarget("SIGTERM");

  const deadline = Date.now() + 5000;
  while (isProcessRunning(pid) && Date.now() < deadline) {
    await new Promise<void>((r) => setTimeout(r, 100));
  }

  if (isProcessRunning(pid)) {
    killTarget("SIGKILL");
    // Give SIGKILL a moment to take effect.
    await new Promise<void>((r) => setTimeout(r, 500));
  }

  return !isProcessRunning(pid);
}

// The default export is an async function that BullMQ will execute.
export default async function (job: Job<SimulateData>): Promise<string> {
  // Use console.log for debugging in the sandboxed process.
  console.log(`[Sandboxed Process ${process.pid}] Starting job ${job.id}`);

  // Declared outside try so the finally block can always access them for cleanup,
  // even when job.data is malformed and throws before they are initialised.
  // Both must be set together: cleanup requires matching lock content with the file path.
  let pidFilePath: string | undefined;
  let myLockContent: string | undefined;

  try {
    // All data access and path setup is inside try so that any error here still
    // reaches the finally block (Prisma disconnect + lock-file cleanup).
    const {
      user: { username },
      simulationId,
    } = job.data;

    const folder = path.resolve(`/files/${username}/${simulationId}`);
    const folderRun = path.resolve(folder, "run");
    const fileLogPath = path.resolve(folderRun, "logs", "gmx.log");
    const fileStepPath = path.resolve(folder, "steps.txt");
    pidFilePath = path.resolve(folder, "processing.pid");

    // Lock content includes the process start time to guard against PID reuse:
    // a recycled PID will have a different starttime and will be ignored.
    const myStartTime = readProcessStartTime(process.pid) ?? "";
    myLockContent = `${process.pid}:${myStartTime}`;

    // When the API restarts, a previously active sandboxed process becomes an
    // orphan (its IPC channel to the Worker is severed). BullMQ will eventually
    // detect the job as stalled and re-queue it, spawning this new process.
    // To avoid two processes writing to the same files simultaneously, we check
    // for a lock file left by the previous run and terminate that process first.
    if (existsSync(pidFilePath)) {
      const raw = readFileSync(pidFilePath, "utf-8").trim();
      const colonIdx = raw.indexOf(":");
      const pidStr = colonIdx >= 0 ? raw.slice(0, colonIdx) : raw;
      const storedStartTime = colonIdx >= 0 ? raw.slice(colonIdx + 1) : "";
      const existingPid = parseInt(pidStr, 10);

      if (!Number.isSafeInteger(existingPid) || existingPid <= 0) {
        console.warn(
          `[Sandboxed Process ${process.pid}] Lock file contained invalid PID "${pidStr}" — ignoring`,
        );
      } else if (existingPid !== process.pid) {
        const actualStartTime = readProcessStartTime(existingPid);
        if (actualStartTime === null) {
          if (isProcessRunning(existingPid)) {
            // The process is alive but its /proc entry cannot be read, so we
            // cannot verify its identity. Fail closed to prevent two writers.
            throw new Error(
              `Unable to verify identity of existing process ${existingPid} for simulation ${simulationId} — aborting to avoid concurrent writes`,
            );
          }
          // Process is no longer running — lock is stale, safe to proceed.
        } else if (actualStartTime !== storedStartTime) {
          // Start times differ: the PID was reused by an unrelated process.
          // Do NOT kill it.
          console.log(
            `[Sandboxed Process ${process.pid}] PID ${existingPid} in lock file appears to have been reused by an unrelated process — ignoring`,
          );
        } else {
          // Start times match: this is genuinely the orphaned process.
          const terminated = await terminateProcess(existingPid);
          if (!terminated) {
            throw new Error(
              `Could not terminate orphaned process ${existingPid} — aborting to prevent concurrent writes to simulation ${simulationId}`,
            );
          }
          console.log(
            `[Sandboxed Process ${process.pid}] Terminated orphaned process ${existingPid} for simulation ${simulationId}`,
          );
        }
      }
    }

    writeFileSync(pidFilePath, myLockContent);

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
    // Only remove the lock file when it still contains OUR content. If an
    // orphaned process we replaced runs its own finally block, it must not
    // delete the lock written by the new (current) process.
    if (pidFilePath !== undefined && myLockContent !== undefined && existsSync(pidFilePath)) {
      try {
        const recorded = readFileSync(pidFilePath, "utf-8").trim();
        if (recorded === myLockContent) {
          unlinkSync(pidFilePath);
        }
      } catch {
        // Best-effort cleanup.
      }
    }
    // IMPORTANT: Disconnect Prisma to allow the sandboxed process to exit cleanly.
    await prisma.$disconnect();
  }
}
