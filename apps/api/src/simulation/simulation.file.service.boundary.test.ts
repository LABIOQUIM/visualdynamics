import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { text } from "node:stream/consumers";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it } from "vitest";

import { withEnv } from "../test-utils/env.js";

import { SimulationFileService } from "./simulation.file.service.js";

describe("SimulationFileService boundary filesystem access", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("returns a real commands file stream from FILES_ROOT", async () => {
    const filesRoot = mkdtempSync(join(tmpdir(), "visualdynamics-api-files-"));
    tempDirs.push(filesRoot);

    const commandsPath = join(filesRoot, "owner", "sim-1", "commands.txt");
    mkdirSync(dirname(commandsPath), { recursive: true });
    writeFileSync(commandsPath, "gmx grompp\n");

    const service = new SimulationFileService();

    await withEnv({ FILES_ROOT: filesRoot }, async () => {
      const file = await service.getSimulationCommands("owner", "sim-1");

      expect(file).not.toBe("no-commands");
      if (file === "no-commands") {
        throw new Error("Expected commands stream");
      }

      await expect(text(file.stream)).resolves.toBe("gmx grompp\n");
      expect(file.size).toBeGreaterThan(0);
    });
  });

  it("returns a real log file stream from FILES_ROOT", async () => {
    const filesRoot = mkdtempSync(join(tmpdir(), "visualdynamics-api-files-"));
    tempDirs.push(filesRoot);

    const logPath = join(filesRoot, "owner", "sim-1", "run", "logs", "gmx.log");
    mkdirSync(dirname(logPath), { recursive: true });
    writeFileSync(logPath, "md.log\n");

    const service = new SimulationFileService();

    await withEnv({ FILES_ROOT: filesRoot }, async () => {
      const file = await service.getSimulationGromacsLogs("owner", "sim-1");

      expect(file).not.toBe("no-logs");
      if (file === "no-logs") {
        throw new Error("Expected logs stream");
      }

      await expect(text(file.stream)).resolves.toBe("md.log\n");
      expect(file.size).toBeGreaterThan(0);
    });
  });
});
