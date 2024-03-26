import * as fs from "fs";
import * as path from "path";

export async function loadCommands(folder: string): Promise<string[]> {
  const fileCommandsPath = path.join(folder, "commands.txt");
  try {
    const data = await fs.promises.readFile(fileCommandsPath, "utf-8");
    return data.split(/\r?\n/); // Split on newline characters (including CR+LF)
  } catch (err) {
    console.error("Error reading commands file:", err);
    throw err; // Re-throw the error for handling in the calling code
  }
}
