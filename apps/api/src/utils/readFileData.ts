import { readFileSync } from "node:fs";

export function readFileData(filePath: string, isLog: boolean): string[] {
  if (isLog) {
    return readFileSync(filePath, { encoding: "utf-8" })
      .replaceAll("\r", "\n")
      .split("\n")
      .filter((l) => l.length)
      .reverse();
  }

  return readFileSync(filePath, { encoding: "utf-8" })
    .split("\n")
    .filter((s) => s.length);
}
