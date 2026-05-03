import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

const {
  cpSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
  normalizeString,
  renderTemplate,
  cwd,
} = vi.hoisted(() => ({
  cpSync: vi.fn(),
  mkdirSync: vi.fn(),
  readFileSync: vi.fn(),
  renameSync: vi.fn(),
  writeFileSync: vi.fn(),
  normalizeString: vi.fn((value: string) => `norm-${value}`),
  renderTemplate: vi.fn((_template: string, vars: Record<string, string>) =>
    Object.entries(vars)
      .map(([k, v]) => `${k}=${v}`)
      .join("\n"),
  ),
  cwd: vi.fn(() => "/repo"),
}));

vi.mock("fs", () => ({
  cpSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
}));

vi.mock("process", () => ({
  cwd,
}));

vi.mock("../utils/normalizeString.js", () => ({
  normalizeString,
}));

vi.mock("../utils/renderTemplate.js", () => ({
  renderTemplate,
}));

import { createPrismaStub, createQueueStub } from "../test-utils/mocks.js";

import { SimulationCreationService } from "./simulation.creation.service.js";

function createBody(overrides: Record<string, unknown> = {}) {
  return {
    type: "apo",
    forceField: "amber03",
    waterModel: "tip3p",
    boxType: "cubic",
    boxDistance: "1.0",
    ...overrides,
  } as any;
}

describe("SimulationCreationService", () => {
  it("prepares the simulation environment with and without ligands", async () => {
    vi.clearAllMocks();
    const service = new SimulationCreationService(
      createQueueStub() as any,
      createPrismaStub() as any,
    );

    await service.prepareSimulationEnvironment("sim-1", "owner/protein.pdb");
    await service.prepareSimulationEnvironment("sim-2", "owner/protein.pdb", [
      { itp: "owner/a.itp", pdb: "owner/a.pdb" },
      { itp: "owner/b.itp", pdb: "owner/b.pdb" },
    ]);

    expect(mkdirSync).toHaveBeenCalled();
    expect(renameSync).toHaveBeenCalledWith(
      "/files/owner/protein.pdb",
      "/files/owner/sim-1/run/protein.pdb",
    );
    expect(cpSync).toHaveBeenCalledWith(
      "/repo/static/mdp",
      "/files/owner/sim-1/run",
      {
        recursive: true,
      },
    );
    expect(cpSync).toHaveBeenCalledWith(
      "/files/owner/sim-2/run/a.pdb",
      "/files/owner/sim-2/run/originalLigand_0.pdb",
    );
  });

  it("queues simulations and updates status", async () => {
    vi.clearAllMocks();
    const prisma = createPrismaStub() as any;
    prisma.user = {
      findFirst: vi.fn().mockResolvedValue({ id: "u1" }),
    };
    prisma.simulation.update.mockResolvedValue(undefined);
    const queue = createQueueStub({
      add: vi.fn().mockResolvedValue(undefined) as any,
    }) as any;
    const service = new SimulationCreationService(queue, prisma as any);

    await expect(
      service.addSimulationToQueue("sim-1", "owner", "apo" as any, "ok", "err"),
    ).resolves.toBeUndefined();

    expect(prisma.simulation.update).toHaveBeenCalledWith({
      where: { id: "sim-1" },
      data: { status: "QUEUED" },
    });
    expect(queue.add).toHaveBeenCalledWith("simulation", {
      simulationId: "sim-1",
      user: { id: "u1" },
      type: "apo",
      successEmail: "ok",
      errorEmail: "err",
    });
  });

  it("creates ACPYPE simulations with ligand metadata and rendered commands", async () => {
    vi.clearAllMocks();
    const prisma = createPrismaStub();
    prisma.simulation.create = vi.fn().mockResolvedValue({ id: "sim-1" });
    const service = new SimulationCreationService(
      createQueueStub() as any,
      prisma as any,
    );
    const prepareSpy = vi
      .spyOn(service, "prepareSimulationEnvironment")
      .mockResolvedValue(undefined);
    readFileSync.mockReturnValue("template");

    const result = await service.newACPYPESimulation(
      "owner/protein.pdb",
      "Protein.pdb",
      [
        {
          fileNameITP: "owner/a_GMX.itp",
          fileNameITPOriginal: "LigA_GMX.itp",
          fileNamePDB: "owner/a.pdb",
          fileNamePDBOriginal: "LigA.pdb",
        },
        {
          fileNameITP: "owner/b_GMX.itp",
          fileNameITPOriginal: "LigA_GMX.itp",
          fileNamePDB: "owner/b.pdb",
          fileNamePDBOriginal: "LigA.pdb",
        },
      ],
      createBody({ type: "acpype" }),
    );

    expect(prisma.simulation.create).toHaveBeenCalled();
    expect(writeFileSync).toHaveBeenCalledWith(
      "/files/owner/sim-1/commands.txt",
      expect.stringContaining("ligandComplexCommands="),
    );
    expect(prepareSpy).toHaveBeenCalledWith("sim-1", "owner/protein.pdb", [
      { itp: "owner/a_GMX.itp", pdb: "owner/a.pdb" },
      { itp: "owner/b_GMX.itp", pdb: "owner/b.pdb" },
    ]);
    expect(result.simulationId).toBe("sim-1");
    expect(result.commands.length).toBeGreaterThan(0);
  });

  it("accepts ligand filenames that are already basenames", async () => {
    vi.clearAllMocks();
    const prisma = createPrismaStub();
    prisma.simulation.create = vi.fn().mockResolvedValue({ id: "sim-plain" });
    const service = new SimulationCreationService(
      createQueueStub() as any,
      prisma as any,
    );
    vi.spyOn(service, "prepareSimulationEnvironment").mockResolvedValue(
      undefined,
    );
    readFileSync.mockReturnValue("template");

    await expect(
      service.newACPYPESimulation(
        "owner/protein.pdb",
        "Protein.pdb",
        [
          {
            fileNameITP: "a_GMX.itp",
            fileNameITPOriginal: "LigA_GMX.itp",
            fileNamePDB: "a.pdb",
            fileNamePDBOriginal: "LigA.pdb",
          },
        ],
        createBody({ type: "acpype" }),
      ),
    ).resolves.toMatchObject({ simulationId: "sim-plain" });
  });

  it("creates APO simulations with rendered commands", async () => {
    vi.clearAllMocks();
    const prisma = createPrismaStub();
    prisma.simulation.create = vi.fn().mockResolvedValue({ id: "sim-2" });
    const service = new SimulationCreationService(
      createQueueStub() as any,
      prisma as any,
    );
    const prepareSpy = vi
      .spyOn(service, "prepareSimulationEnvironment")
      .mockResolvedValue(undefined);
    readFileSync.mockReturnValue("apo template");

    const result = await service.newAPOSimulation(
      "owner/protein.pdb",
      "Protein.pdb",
      createBody({ type: "apo" }),
    );

    expect(writeFileSync).toHaveBeenCalledWith(
      "/files/owner/sim-2/commands.txt",
      expect.stringContaining("fullFileName=protein.pdb"),
    );
    expect(prepareSpy).toHaveBeenCalledWith("sim-2", "owner/protein.pdb");
    expect(result.simulationId).toBe("sim-2");
  });

  it("rejects invalid simulation parameters and unsafe filenames", async () => {
    vi.clearAllMocks();
    const service = new SimulationCreationService(
      createQueueStub() as any,
      createPrismaStub() as any,
    );

    await expect(
      service.newAPOSimulation(
        "owner/protein.pdb",
        "Protein.pdb",
        createBody({ forceField: "bad" }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.newAPOSimulation(
        "owner/protein.pdb",
        "Protein.pdb",
        createBody({ waterModel: "bad" }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.newAPOSimulation(
        "owner/protein.pdb",
        "Protein.pdb",
        createBody({ boxType: "bad" }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.newAPOSimulation(
        "owner/protein.pdb",
        "Protein.pdb",
        createBody({ boxDistance: "bad" }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.newAPOSimulation(
        "owner/prot$ein.pdb",
        "Protein.pdb",
        createBody(),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.newACPYPESimulation(
        "owner/protein.pdb",
        "Protein.pdb",
        [
          {
            fileNameITP: "owner/a bad.itp",
            fileNameITPOriginal: "Lig_GMX.itp",
            fileNamePDB: "owner/a.pdb",
            fileNamePDBOriginal: "Lig.pdb",
          },
        ],
        createBody({ type: "acpype" }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.newACPYPESimulation(
        "owner/protein.pdb",
        "Protein.pdb",
        [
          {
            fileNameITP: "owner/a_GMX.itp",
            fileNameITPOriginal: "Lig_GMX.itp",
            fileNamePDB: "owner/a bad.pdb",
            fileNamePDBOriginal: "Lig.pdb",
          },
        ],
        createBody({ type: "acpype" }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.newACPYPESimulation(
        "owner/protein.pdb",
        "Protein.pdb",
        [
          {
            fileNameITP: "owner/a_GMX.itp",
            fileNameITPOriginal: "Lig$Bad_GMX.itp",
            fileNamePDB: "owner/a.pdb",
            fileNamePDBOriginal: "Lig.pdb",
          },
        ],
        createBody({ type: "acpype" }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("wraps template read failures for ACPYPE and APO templates", async () => {
    vi.clearAllMocks();
    const prisma = createPrismaStub();
    prisma.simulation.create = vi.fn().mockResolvedValue({ id: "sim-1" });
    const service = new SimulationCreationService(
      createQueueStub() as any,
      prisma as any,
    );
    readFileSync.mockImplementation(() => {
      throw new Error("missing template");
    });

    await expect(
      service.newACPYPESimulation(
        "owner/protein.pdb",
        "Protein.pdb",
        [
          {
            fileNameITP: "owner/a_GMX.itp",
            fileNameITPOriginal: "Lig_GMX.itp",
            fileNamePDB: "owner/a.pdb",
            fileNamePDBOriginal: "Lig.pdb",
          },
        ],
        createBody({ type: "acpype" }),
      ),
    ).rejects.toThrow(
      "Failed to load ACPYPE command template: missing template",
    );

    await expect(
      service.newAPOSimulation(
        "owner/protein.pdb",
        "Protein.pdb",
        createBody({ type: "apo" }),
      ),
    ).rejects.toThrow("Failed to load APO command template: missing template");
  });

  it("stringifies non-Error template failures", async () => {
    vi.clearAllMocks();
    const prisma = createPrismaStub();
    prisma.simulation.create = vi.fn().mockResolvedValue({ id: "sim-1" });
    const service = new SimulationCreationService(
      createQueueStub() as any,
      prisma as any,
    );
    readFileSync.mockImplementation(() => {
      throw "bad-template";
    });

    await expect(
      service.newACPYPESimulation(
        "owner/protein.pdb",
        "Protein.pdb",
        [
          {
            fileNameITP: "owner/a_GMX.itp",
            fileNameITPOriginal: "Lig_GMX.itp",
            fileNamePDB: "owner/a.pdb",
            fileNamePDBOriginal: "Lig.pdb",
          },
        ],
        createBody({ type: "acpype" }),
      ),
    ).rejects.toThrow("Failed to load ACPYPE command template: bad-template");

    await expect(
      service.newAPOSimulation(
        "owner/protein.pdb",
        "Protein.pdb",
        createBody({ type: "apo" }),
      ),
    ).rejects.toThrow("Failed to load APO command template: bad-template");
  });
});
