import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { quote } from "shell-quote";

interface ProcessResult {
  pid: number;
  returncode: number;
}

export function runCommand(
  command: string,
  logFile: string,
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
      let cmd: string;
      let otherArgs: string[];

      if (shouldUseShell) {
        cmd = "/bin/sh";
        otherArgs = ["-c", quote(args)];
      } else {
        cmd = args[0];
        otherArgs = args.slice(1);
      }

      const process = spawn(cmd, otherArgs, {
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
      });

      process.stdout.pipe(logStream);
      process.stderr.pipe(logStream);

      process.once("close", (code) => {
        resolve({ pid: process.pid ?? 0, returncode: code ?? 1 });
      });
    }
  });
}
