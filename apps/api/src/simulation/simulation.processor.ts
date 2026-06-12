import { Job } from "bullmq";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import * as path from "path";
import { chdir } from "process";

import { executeCommands } from "../utils/executeCommands.js";
import { loadCommands } from "../utils/loadCommands.js";

import { SimulateData } from "./simulation.types.js";

export function readProcessStartTime(pid: number): string | null {
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, "utf-8");
    const afterComm = stat.slice(stat.lastIndexOf(")") + 2);
    return afterComm.split(" ")[19] ?? null;
  } catch {
    return null;
  }
}

export function readProcessGroupId(pid: number): number | null {
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, "utf-8");
    const afterComm = stat.slice(stat.lastIndexOf(")") + 2);
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
    const code = (error as NodeJS.ErrnoException)?.code;
    return code !== "ESRCH";
  }
}

export async function terminateProcess(pid: number): Promise<boolean> {
  const pgid = readProcessGroupId(pid);
  const ownPgid = readProcessGroupId(process.pid);
  const safeToGroupKill =
    pgid !== null && pgid > 0 && ownPgid !== null && pgid !== ownPgid;

  const killTarget = (sig: NodeJS.Signals) => {
    if (safeToGroupKill) {
      try {
        process.kill(-(pgid as number), sig);
        return;
      } catch {}
    }
    try {
      process.kill(pid, sig);
    } catch {}
  };

  killTarget("SIGTERM");

  const deadline = Date.now() + 5000;
  while (isProcessRunning(pid) && Date.now() < deadline) {
    await new Promise<void>((r) => setTimeout(r, 100));
  }

  if (isProcessRunning(pid)) {
    killTarget("SIGKILL");
    await new Promise<void>((r) => setTimeout(r, 500));
  }

  return !isProcessRunning(pid);
}

export default async function (job: Job<SimulateData>): Promise<string> {
  console.log(`[Sandboxed Process ${process.pid}] Starting job ${job.id}`);

  let pidFilePath: string | undefined;
  let myLockContent: string | undefined;

  try {
    const {
      user: { username },
      simulationId,
    } = job.data;

    const folder = path.resolve(`/files/${username}/${simulationId}`);
    const folderRun = path.resolve(folder, "run");
    const fileLogPath = path.resolve(folderRun, "logs", "gmx.log");
    const fileStepPath = path.resolve(folder, "steps.txt");
    pidFilePath = path.resolve(folder, "processing.pid");

    const myStartTime = readProcessStartTime(process.pid) ?? "";
    myLockContent = `${process.pid}:${myStartTime}`;

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
        await new Promise<void>((resolve) =>
          setTimeout(resolve, 50 * lockRetries),
        );

        let raw: string;
        try {
          raw = readFileSync(pidFilePath, "utf-8").trim();
        } catch {
          continue;
        }
        const colonIdx = raw.indexOf(":");
        const pidStr = colonIdx >= 0 ? raw.slice(0, colonIdx) : raw;
        const storedStartTime = colonIdx >= 0 ? raw.slice(colonIdx + 1) : "";
        const existingPid = parseInt(pidStr, 10);

        const lockPath = pidFilePath;
        const removeStale = (expectedContent: string) => {
          try {
            const current = readFileSync(lockPath, "utf-8").trim();
            if (current !== expectedContent) return;
            unlinkSync(lockPath);
          } catch (unlinkErr: unknown) {
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
              throw new Error(
                `Unable to verify identity of existing process ${existingPid} for simulation ${simulationId} — aborting to avoid concurrent writes`,
              );
            }
            removeStale(raw);
          } else if (storedStartTime === "") {
            if (isProcessRunning(existingPid)) {
              throw new Error(
                `Lock file for simulation ${simulationId} contains no start time for PID ${existingPid} — cannot verify identity; aborting to avoid concurrent writes`,
              );
            }
            removeStale(raw);
          } else if (actualStartTime !== storedStartTime) {
            console.log(
              `[Sandboxed Process ${process.pid}] PID ${existingPid} in lock file appears to have been reused by an unrelated process — removing stale lock`,
            );
            removeStale(raw);
          } else {
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
      }
    }

    const commands = await loadCommands(folder);

    chdir(folderRun);
    writeFileSync(fileStepPath, "");
    await executeCommands(commands, fileStepPath, fileLogPath);

    console.log(`[Sandboxed Process ${process.pid}] Finished job ${job.id}`);

    return `${simulationId} done!`;
  } catch (e) {
    console.error(
      `[Sandboxed Process ${process.pid}] Job ${job.id} failed:`,
      e,
    );
    throw new Error(
      (e instanceof Error ? e.message : undefined) ||
        `Job ${job.data?.simulationId ?? job.id} failed to run command!`,
    );
  } finally {
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
      } catch {}
    }
  }
}
