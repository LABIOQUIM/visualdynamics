import * as fs from "node:fs";

import { runCommand } from "./runCommand.js";

export async function executeCommands(
  commands: string[],
  fileStepPath: string,
  fileLogPath: string,
  signal?: AbortSignal,
  cwd?: string,
) {
  for (const command of commands) {
    if (signal?.aborted) {
      throw new Error("Simulation cancelled");
    }

    if (command.startsWith("#")) {
      try {
        await fs.promises.appendFile(fileStepPath, `${command}\n`);
      } catch (err) {
        console.error("Error writing step:", err);
        throw err;
      }
    } else if (command.length > 0) {
      const { returncode } = await runCommand(command, fileLogPath, signal, cwd);

      if (returncode > 0) {
        throw new Error(`Command ${command} exited with non-zero return code`);
      }
    }
  }
}
