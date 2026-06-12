import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import * as path from "path";
import { chdir, cwd } from "process";

import { executeCommands } from "../utils/executeCommands.js";
import { loadCommands } from "../utils/loadCommands.js";
import {
  isProcessRunning,
  readProcessStartTime,
  terminateProcess,
} from "../utils/process.js";

import type { SimulateData } from "./simulation.types.js";

@Processor("simulation", { concurrency: 1 })
export class SimulationConsumer extends WorkerHost {
  private activeAbortControllers = new Map<string, AbortController>();

  cancel(simulationId: string): boolean {
    const ctrl = this.activeAbortControllers.get(simulationId);
    if (ctrl) {
      ctrl.abort();
      return true;
    }
    return false;
  }

  async process(job: Job<SimulateData>): Promise<string> {
    console.log(`[Worker Process ${process.pid}] Starting job ${job.id}`);

    let pidFilePath: string | undefined;
    let myLockContent: string | undefined;
    const originalCwd = cwd();
    const abortController = new AbortController();

    try {
      const {
        user: { username },
        simulationId,
      } = job.data;

      this.activeAbortControllers.set(simulationId, abortController);

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
              `[Worker Process ${process.pid}] Lock file contained invalid PID "${pidStr}" — removing and retrying`,
            );
            removeStale(raw);
          } else if (existingPid === process.pid) {
            if (raw === myLockContent) {
              lockAcquired = true;
            } else {
              console.warn(
                `[Worker Process ${process.pid}] Lock file for simulation ${simulationId} has our PID but mismatched content — treating as stale and removing`,
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
                `[Worker Process ${process.pid}] PID ${existingPid} in lock file appears to have been reused by an unrelated process — removing stale lock`,
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
                `[Worker Process ${process.pid}] Terminated orphaned process ${existingPid} for simulation ${simulationId}`,
              );
              removeStale(raw);
            }
          }
        }
      }

      const commands = await loadCommands(folder);

      writeFileSync(fileStepPath, "");
      await executeCommands(
        commands,
        fileStepPath,
        fileLogPath,
        abortController.signal,
        folderRun,
      );

      console.log(`[Worker Process ${process.pid}] Finished job ${job.id}`);

      return `${simulationId} done!`;
    } catch (e) {
      console.error(
        `[Worker Process ${process.pid}] Job ${job.id} failed:`,
        e,
      );
      throw new Error(
        (e instanceof Error ? e.message : undefined) ||
          `Job ${job.data?.simulationId ?? job.id} failed to run command!`,
      );
    } finally {
      try {
        chdir(originalCwd);
      } catch {}
      this.activeAbortControllers.delete(job.data.simulationId);

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
}
