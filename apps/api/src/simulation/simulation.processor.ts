// This file runs in a completely separate process.
// It cannot use NestJS dependency injection.

import { PrismaPg } from "@prisma/adapter-pg";
import { Job } from "bullmq";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import * as path from "path";
import { chdir } from "process";

import { PrismaClient } from "../generated/prisma/client.js";
import { executeCommands } from "../utils/executeCommands.js";
import { loadCommands } from "../utils/loadCommands.js";

import { SimulateData } from "./simulation.types.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * Reads the start time (field 22) from /proc/<pid>/stat. This value is unique
 * per process incarnation and is used to detect PID reuse: if the start time in
 * the lock file doesn't match the running process, the PID belongs to an
 * unrelated process and we must NOT kill it.
 * Returns null when the file cannot be read (process gone or non-Linux env).
 */
export function readProcessStartTime(pid: number): string | null {
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
export function readProcessGroupId(pid: number): number | null {
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

export function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error: unknown) {
    // On POSIX, kill(pid, 0) throws EPERM when the process exists but we lack
    // permission to signal it, and ESRCH when no such process exists.
    // Only ESRCH means the process is gone; all other errors are treated as
    // "running" to avoid falsely concluding the process has exited.
    const code = (error as NodeJS.ErrnoException)?.code;
    return code !== "ESRCH";
  }
}

/**
 * Sends SIGTERM to the process group of `pid` (which also reaches any GROMACS
 * child processes), falling back to a single-process kill if group-signaling
 * fails or is unsafe. Escalates to SIGKILL if the process hasn't exited
 * within 5 s. Returns true when the process is no longer running.
 */
export async function terminateProcess(pid: number): Promise<boolean> {
  // Read the actual PGID from /proc so we target the correct process group
  // even when `pid` is not the process group leader.
  const pgid = readProcessGroupId(pid);
  // Safety: only group-signal when the orphan's PGID is valid and differs
  // from our own. Signaling our own process group would also kill the current
  // sandbox process and the BullMQ worker. Fall back to single-PID kill
  // whenever either PGID cannot be determined.
  const ownPgid = readProcessGroupId(process.pid);
  const safeToGroupKill =
    pgid !== null && pgid > 0 && ownPgid !== null && pgid !== ownPgid;

  const killTarget = (sig: NodeJS.Signals) => {
    if (safeToGroupKill) {
      // Negative PGID signals the whole process group, terminating GROMACS
      // child processes alongside the sandboxed Node process.
      try {
        process.kill(-(pgid as number), sig);
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
    // To avoid two processes writing to the same files simultaneously we
    // atomically acquire a lock file before starting.  Using flag:"wx" means
    // only one process can create the file; every other concurrent starter
    // receives EEXIST and must inspect + resolve the existing owner first.
    const MAX_LOCK_RETRIES = 10;
    let lockAcquired = false;
    let lockRetries = 0;
    while (!lockAcquired) {
      try {
        writeFileSync(pidFilePath, myLockContent, { flag: "wx" });
        lockAcquired = true;
      } catch (createErr: unknown) {
        if ((createErr as NodeJS.ErrnoException).code !== "EEXIST") {
          throw createErr;
        }
        if (lockRetries++ >= MAX_LOCK_RETRIES) {
          throw new Error(
            `Failed to acquire simulation lock for ${simulationId} after ${MAX_LOCK_RETRIES} attempts`,
          );
        }
        // Small backoff before retrying to avoid a tight spin loop.
        await new Promise<void>((resolve) =>
          setTimeout(resolve, 50 * lockRetries),
        );

        // Lock file exists — read and evaluate its owner.
        let raw: string;
        try {
          raw = readFileSync(pidFilePath, "utf-8").trim();
        } catch {
          // File vanished between EEXIST and our read — retry the atomic create.
          continue;
        }
        const colonIdx = raw.indexOf(":");
        const pidStr = colonIdx >= 0 ? raw.slice(0, colonIdx) : raw;
        const storedStartTime = colonIdx >= 0 ? raw.slice(colonIdx + 1) : "";
        const existingPid = parseInt(pidStr, 10);

        // Helper: remove the stale lock file only if it still contains the
        // content we just read (`expectedContent`). This prevents a TOCTOU race
        // where another process deletes the lock and re-creates it between our
        // read and the unlink — in that case we must not delete the new owner's lock.
        const lockPath = pidFilePath;
        const removeStale = (expectedContent: string) => {
          try {
            const current = readFileSync(lockPath, "utf-8").trim();
            if (current !== expectedContent) {
              // Lock was replaced by another process — leave it alone.
              return;
            }
            unlinkSync(lockPath);
          } catch (unlinkErr: unknown) {
            // ENOENT is fine — another process already removed it.
            if ((unlinkErr as NodeJS.ErrnoException).code !== "ENOENT") {
              throw unlinkErr;
            }
          }
        };

        if (!Number.isSafeInteger(existingPid) || existingPid <= 0) {
          console.warn(
            `[Sandboxed Process ${process.pid}] Lock file contained invalid PID "${pidStr}" — removing and retrying`,
          );
          removeStale(raw);
        } else if (existingPid === process.pid) {
          // We already own the lock only if the full content matches what we would write.
          // PID reuse across restarts can produce a stale lock whose PID equals ours
          // but with a different start time; treat that as stale.
          if (raw === myLockContent) {
            lockAcquired = true;
          } else {
            console.warn(
              `[Sandboxed Process ${process.pid}] Lock file for simulation ${simulationId} has our PID but mismatched content — treating as stale and removing`,
            );
            removeStale(raw);
          }
        } else {
          const actualStartTime = readProcessStartTime(existingPid);
          if (actualStartTime === null) {
            if (isProcessRunning(existingPid)) {
              // The process is alive but its /proc entry cannot be read, so we
              // cannot verify its identity. Fail closed to prevent two writers.
              throw new Error(
                `Unable to verify identity of existing process ${existingPid} for simulation ${simulationId} — aborting to avoid concurrent writes`,
              );
            }
            // Process is no longer running — remove stale lock and retry.
            removeStale(raw);
          } else if (storedStartTime === "") {
            // Lock file has no start time — cannot safely verify the process
            // identity. Fail closed if the process appears to be running, to
            // avoid allowing two concurrent writers.
            if (isProcessRunning(existingPid)) {
              throw new Error(
                `Lock file for simulation ${simulationId} contains no start time for PID ${existingPid} — cannot verify identity; aborting to avoid concurrent writes`,
              );
            }
            // Process is gone; remove the unverifiable stale lock and retry.
            removeStale(raw);
          } else if (actualStartTime !== storedStartTime) {
            // Start times differ: the PID was reused by an unrelated process.
            // Do NOT kill it; just remove the stale lock and retry.
            console.log(
              `[Sandboxed Process ${process.pid}] PID ${existingPid} in lock file appears to have been reused by an unrelated process — removing stale lock`,
            );
            removeStale(raw);
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
            removeStale(raw);
          }
        }
        // In all non-throwing, non-owned cases the lock file has been removed
        // (or was already gone). Loop back to retry the atomic wx create.
      }
    }

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
      (e instanceof Error ? e.message : undefined) ||
        `Job ${job.data?.simulationId ?? job.id} failed to run command!`,
    );
  } finally {
    // Only remove the lock file when it still contains OUR content. If an
    // orphaned process we replaced runs its own finally block, it must not
    // delete the lock written by the new (current) process.
    if (
      pidFilePath !== undefined &&
      myLockContent !== undefined &&
      existsSync(pidFilePath)
    ) {
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
