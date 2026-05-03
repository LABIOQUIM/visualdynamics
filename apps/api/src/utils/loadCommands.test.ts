import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it, vi } from "vitest";

import { loadCommands } from "./loadCommands.js";

describe("loadCommands", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("loads commands from commands.txt preserving blank trailing entries", async () => {
    const dir = mkdtempSync(join(tmpdir(), "visualdynamics-load-"));
    tempDirs.push(dir);
    writeFileSync(join(dir, "commands.txt"), "one\r\ntwo\n");

    await expect(loadCommands(dir)).resolves.toEqual(["one", "two", ""]);
  });

  it("rethrows read errors", async () => {
    const dir = mkdtempSync(join(tmpdir(), "visualdynamics-load-"));
    tempDirs.push(dir);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(loadCommands(dir)).rejects.toBeInstanceOf(Error);
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
