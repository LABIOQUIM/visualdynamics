import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it } from "vitest";

import { readFileData } from "./readFileData.js";

describe("readFileData", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("returns regular file lines in original order without empty entries", () => {
    const dir = mkdtempSync(join(tmpdir(), "visualdynamics-read-"));
    tempDirs.push(dir);
    const filePath = join(dir, "file.txt");
    writeFileSync(filePath, "alpha\n\nbeta\n");

    expect(readFileData(filePath, false)).toEqual(["alpha", "beta"]);
  });

  it("normalizes and reverses log lines", () => {
    const dir = mkdtempSync(join(tmpdir(), "visualdynamics-read-"));
    tempDirs.push(dir);
    const filePath = join(dir, "file.log");
    writeFileSync(filePath, "one\r\ntwo\r\n");

    expect(readFileData(filePath, true)).toEqual(["two", "one"]);
  });
});
