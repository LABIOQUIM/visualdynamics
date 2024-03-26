import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface ProcessResult {
  pid: number;
  returncode: number;
}

export function runCommand(
  command: string,
  logFile: string
): Promise<ProcessResult> {
  const args = command.split(/\s+/); // Split command into arguments
  const shouldUseShell = command.includes(">");

  return new Promise((resolve, reject) => {
    const logFilePath = path.resolve(logFile);
    const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

    fs.appendFile(logFilePath, "\n", (err) => {
      if (err) reject(err);
      else tryRunCommand();
    });

    function tryRunCommand() {
      const cmd = shouldUseShell ? command : args[0];
      const otherArgs = shouldUseShell ? [] : args.slice(1);

      const process = spawn(cmd, otherArgs, {
        shell: true,
        stdio: ["ignore", "pipe", "pipe"],
      });

      process.stdout.pipe(logStream);
      process.stderr.pipe(logStream);

      process.once("close", (code) => {
        resolve({ pid: process.pid, returncode: code });
      });
    }
  });
}
