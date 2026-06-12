import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

import { terminateProcess } from "./process.js";

interface ProcessResult {
  pid: number;
  returncode: number;
}

export function runCommand(
  command: string,
  logFile: string,
  signal?: AbortSignal,
  cwd?: string,
): Promise<ProcessResult> {
  const args = command.split(/\s+/);
  const shouldUseShell = command.includes(">");

  return new Promise((resolve, reject) => {
    const logFilePath = path.resolve(logFile);
    const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

    fs.appendFile(logFilePath, `\n${command}`, (err) => {
      if (err) reject(err);
      else tryRunCommand();
    });

    function tryRunCommand() {
      const cmd = shouldUseShell ? command : args[0];
      const otherArgs = shouldUseShell ? [] : args.slice(1);

      const child = spawn(cmd, otherArgs, {
        shell: true,
        stdio: ["ignore", "pipe", "pipe"],
        cwd,
      });

      if (signal) {
        if (signal.aborted) {
          child.kill("SIGKILL");
          reject(new Error("Simulation cancelled"));
          return;
        }

        const onAbort = () => {
          child.kill("SIGKILL");
          if (child.pid !== undefined) {
            terminateProcess(child.pid);
          }
        };

        signal.addEventListener("abort", onAbort, { once: true });
      }

      child.stdout.pipe(logStream);
      child.stderr.pipe(logStream);

      child.once("close", (code) => {
        if (signal) {
          signal.removeEventListener("abort", () => {});
        }
        resolve({ pid: child.pid ?? -1, returncode: code ?? -1 });
      });
    }
  });
}
