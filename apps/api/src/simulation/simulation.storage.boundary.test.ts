import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it, vi } from "vitest";

import { withEnv } from "../test-utils/env.js";
import { createPrismaStub, createQueueStub } from "../test-utils/mocks.js";

import { SimulationService } from "./simulation.service.js";

describe("SimulationService boundary storage lookup", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("reads stored simulation files from the owner path under FILES_ROOT", async () => {
    const filesRoot = mkdtempSync(
      join(tmpdir(), "visualdynamics-api-storage-"),
    );
    tempDirs.push(filesRoot);

    const simulationDir = join(filesRoot, "owner", "sim-1");
    mkdirSync(join(simulationDir, "run", "logs"), { recursive: true });
    writeFileSync(join(simulationDir, "steps.txt"), "step-1\nstep-2\n");
    writeFileSync(
      join(simulationDir, "run", "logs", "gmx.log"),
      "log-1\r\nlog-2\r\n",
    );
    writeFileSync(
      join(simulationDir, "run", "originalMacromolecule.pdb"),
      "ATOM\n",
    );
    writeFileSync(
      join(simulationDir, "run", "originalLigand_0.pdb"),
      "HETATM\n",
    );

    const prisma = createPrismaStub();
    prisma.simulation.findFirst.mockResolvedValue({
      id: "sim-1",
      errorCause: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      moleculeName: "Protein",
      startedAt: null,
      endedAt: null,
      status: "GENERATED",
      type: "APO",
      storageDeletedAt: null,
      ligands: [
        {
          ligandITPName: "ligand.itp",
          ligandPDBName: "ligand.pdb",
          position: 0,
        },
      ],
      user: {
        username: "owner",
      },
    });

    const service = new SimulationService(
      createQueueStub({
        getJobs: vi.fn().mockResolvedValue([]),
      }) as any,
      prisma as any,
    );

    await withEnv({ FILES_ROOT: filesRoot }, async () => {
      const result = await service.getSimulationDetails("admin", true, "sim-1");

      expect(result?.isStored).toBe(true);
      expect(result?.stepData).toEqual(["step-1", "step-2"]);
      expect(result?.logData).toEqual(["log-2", "log-1"]);
      expect(result?.molecules.macromolecule).toBe("ATOM");
      expect(result?.molecules.ligands).toEqual(["HETATM"]);
    });
  });
});
