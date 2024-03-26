import * as fs from "fs";

import { runCommand } from "./runCommand";

export async function executeCommands(
  commands: string[],
  fileStepPath: string,
  fileLogPath: string
) {
  for (const command of commands) {
    if (command.startsWith("#")) {
      try {
        await fs.promises.appendFile(fileStepPath, `${command}\n`);
      } catch (err) {
        console.error("Error writing step:", err);
        throw err; // Re-throw for handling in the calling code
      }
    } else if (command.length > 0) {
      const { returncode } = await runCommand(command, fileLogPath);

      if (returncode > 0) {
        throw new Error(`Command ${command} exited with non-zero return code`);
      }
    }
  }
}
