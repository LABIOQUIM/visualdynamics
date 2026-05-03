import {
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getBooleanValue = vi.fn();
const getNumberValue = vi.fn();

vi.mock("../multer.config.js", () => ({
  default: {},
}));

vi.mock("@openfeature/server-sdk", () => ({
  OpenFeature: {
    getClient: () => ({
      getBooleanValue,
      getNumberValue,
    }),
  },
}));

import { SIMULATION_TYPE } from "../generated/prisma/enums.js";
import { createSession } from "../test-utils/session.js";

import { SimulationCreationService } from "./simulation.creation.service.js";
import { SimulationController } from "./simulation.controller.js";
import { SimulationFileService } from "./simulation.file.service.js";
import { SimulationService } from "./simulation.service.js";

function createModule({
  simulationService = {},
  creationService = {},
  fileService = {},
}: {
  simulationService?: Partial<SimulationService>;
  creationService?: Partial<SimulationCreationService>;
  fileService?: Partial<SimulationFileService>;
} = {}) {
  return Test.createTestingModule({
    controllers: [SimulationController],
    providers: [
      { provide: SimulationService, useValue: simulationService },
      { provide: SimulationCreationService, useValue: creationService },
      { provide: SimulationFileService, useValue: fileService },
    ],
  }).compile();
}

describe("SimulationController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getBooleanValue.mockResolvedValue(true);
    getNumberValue.mockResolvedValue(20);
  });

  it("blocks submission when the flag is disabled", async () => {
    getBooleanValue.mockResolvedValue(false);
    const module = await createModule();
    const controller = module.get(SimulationController);

    await expect(
      controller.newSimulation(
        {
          filePDB: [{ filename: "owner/file.pdb", originalname: "file.pdb" }],
        } as any,
        { type: "apo" } as any,
        { session: { user: { username: "owner" } } } as any,
      ),
    ).rejects.toMatchObject({ response: { status: "submission-disabled" } });
  });

  it("validates required pdb file and simulation type", async () => {
    const module = await createModule();
    const controller = module.get(SimulationController);

    await expect(
      controller.newSimulation(
        undefined as any,
        { type: "apo" } as any,
        {
          session: { user: { username: "owner" } },
        } as any,
      ),
    ).rejects.toMatchObject({ response: { status: "no-pdb-file" } });

    await expect(
      controller.newSimulation(
        {
          filePDB: [{ filename: "owner/file.pdb", originalname: "file.pdb" }],
        } as any,
        { type: "bad" } as any,
        { session: { user: { username: "owner" } } } as any,
      ),
    ).rejects.toMatchObject({
      response: { status: "invalid-simulation-type" },
    });
  });

  it("validates ACPYPE ligand requirements", async () => {
    const module = await createModule();
    const controller = module.get(SimulationController);
    const request = { session: { user: { username: "owner" } } } as any;
    const filePDB = [{ filename: "owner/file.pdb", originalname: "file.pdb" }];

    await expect(
      controller.newSimulation(
        { filePDB } as any,
        { type: "acpype" } as any,
        request,
      ),
    ).rejects.toMatchObject({ response: { status: "missing-ligand-files" } });

    await expect(
      controller.newSimulation(
        {
          filePDB,
          fileLigandITP: [{ filename: "owner/a.itp", originalname: "a.itp" }],
          fileLigandPDB: [
            { filename: "owner/a.pdb", originalname: "a.pdb" },
            { filename: "owner/b.pdb", originalname: "b.pdb" },
          ],
        } as any,
        { type: "acpype" } as any,
        request,
      ),
    ).rejects.toMatchObject({
      response: { status: "ligand-files-count-mismatch" },
    });

    getNumberValue.mockResolvedValue(0);
    await expect(
      controller.newSimulation(
        {
          filePDB,
          fileLigandITP: [{ filename: "owner/a.itp", originalname: "a.itp" }],
          fileLigandPDB: [{ filename: "owner/a.pdb", originalname: "a.pdb" }],
        } as any,
        { type: "acpype" } as any,
        request,
      ),
    ).rejects.toMatchObject({
      response: { status: "too-many-ligands", max: 0 },
    });
  });

  it("creates ACPYPE simulations and optionally queues them", async () => {
    const newACPYPESimulation = vi
      .fn()
      .mockResolvedValue({ simulationId: "sim-1", commands: ["cmd\n"] });
    const addSimulationToQueue = vi.fn().mockResolvedValue(undefined);
    const module = await createModule({
      creationService: { newACPYPESimulation, addSimulationToQueue },
    });
    const controller = module.get(SimulationController);
    const request = { session: { user: { username: "owner" } } } as any;
    const files = {
      filePDB: [{ filename: "owner/file.pdb", originalname: "file.pdb" }],
      fileLigandITP: [{ filename: "owner/a.itp", originalname: "lig.itp" }],
      fileLigandPDB: [{ filename: "owner/a.pdb", originalname: "lig.pdb" }],
    };

    await expect(
      controller.newSimulation(
        files as any,
        { type: "acpype" } as any,
        request,
      ),
    ).resolves.toEqual({ status: "generated", commands: ["cmd\n"] });

    await expect(
      controller.newSimulation(
        files as any,
        {
          type: "acpype",
          shouldRun: "true",
          successEmail: "ok@example.com",
          errorEmail: "err@example.com",
        } as any,
        request,
      ),
    ).resolves.toEqual({ status: "added-to-queue", simulationId: "sim-1" });

    expect(addSimulationToQueue).toHaveBeenCalledWith(
      "sim-1",
      "owner",
      "acpype",
      "ok@example.com",
      "err@example.com",
    );
  });

  it("creates APO simulations and optionally queues them", async () => {
    const newAPOSimulation = vi
      .fn()
      .mockResolvedValue({ simulationId: "sim-2", commands: ["apo\n"] });
    const addSimulationToQueue = vi.fn().mockResolvedValue(undefined);
    const module = await createModule({
      creationService: { newAPOSimulation, addSimulationToQueue },
    });
    const controller = module.get(SimulationController);
    const request = { session: { user: { username: "owner" } } } as any;
    const files = {
      filePDB: [{ filename: "owner/file.pdb", originalname: "file.pdb" }],
    };

    await expect(
      controller.newSimulation(files as any, { type: "apo" } as any, request),
    ).resolves.toEqual({ status: "generated", commands: ["apo\n"] });

    await expect(
      controller.newSimulation(
        files as any,
        { type: "apo", shouldRun: "true" } as any,
        request,
      ),
    ).resolves.toEqual({ status: "added-to-queue", simulationId: "sim-2" });
  });

  it("covers read-only simulation endpoints", async () => {
    const getSimulationDetails = vi.fn().mockResolvedValue({
      isStored: true,
      simulation: { user: { username: "owner" } },
    });
    const getUserSimulations = vi
      .fn()
      .mockResolvedValue({ records: [], total: 0 });
    const getMgmtSimulations = vi
      .fn()
      .mockResolvedValue({ records: [], total: 0 });
    const cancelSimulation = vi.fn().mockResolvedValue({ status: "ok" });
    const adminUpdateSimulation = vi
      .fn()
      .mockResolvedValue({ status: "updated" });
    const adminImportSimulations = vi.fn().mockResolvedValue({ imported: 1 });
    const getQueueInfo = vi.fn().mockResolvedValue({ waiting: 1 });
    const module = await createModule({
      simulationService: {
        getSimulationDetails,
        getUserSimulations,
        getMgmtSimulations,
        cancelSimulation,
        adminUpdateSimulation,
        adminImportSimulations,
        getQueueInfo,
      },
    });
    const controller = module.get(SimulationController);
    const userSession = createSession({
      user: { id: "u1", username: "owner" },
    }) as any;
    const adminSession = createSession({
      user: { id: "a1", username: "admin", role: "admin" },
    }) as any;

    await expect(
      controller.getSimulationInfo(userSession, "sim"),
    ).resolves.toMatchObject({
      isStored: true,
    });
    await expect(
      controller.getUserSimulations(userSession, 5, 2),
    ).resolves.toEqual({
      records: [],
      total: 0,
    });
    await expect(
      controller.getMgmtSimulations(adminSession, 5, 2),
    ).resolves.toEqual({
      records: [],
      total: 0,
    });
    await expect(
      controller.cancelSimulation(adminSession, "sim"),
    ).resolves.toEqual({
      status: "ok",
    });
    await expect(
      controller.adminUpdateSimulation(adminSession, "sim", {} as any),
    ).resolves.toEqual({ status: "updated" });
    await expect(
      controller.adminImportSimulations(adminSession, { rows: [1] }),
    ).resolves.toEqual({ imported: 1 });
    await expect(controller.getQueueInfo()).resolves.toEqual({ waiting: 1 });

    expect(getSimulationDetails).toHaveBeenCalledWith("owner", false, "sim");
    expect(getUserSimulations).toHaveBeenCalledWith("u1", 5, 2);
    expect(getMgmtSimulations).toHaveBeenCalledWith("a1", 5, 2);
    expect(cancelSimulation).toHaveBeenCalledWith("sim", "a1", true);
  });

  it("throws on missing simulations and unauthorized admin routes", async () => {
    const module = await createModule({
      simulationService: {
        getSimulationDetails: vi.fn().mockResolvedValue(null),
      },
    });
    const controller = module.get(SimulationController);
    const userSession = createSession() as any;

    await expect(
      controller.getSimulationInfo(userSession, "missing"),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      controller.getMgmtSimulations(userSession, 10, 1),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      controller.adminUpdateSimulation(userSession, "sim", {} as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      controller.adminImportSimulations(userSession, { rows: [] }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("returns files and file-related http exceptions", async () => {
    const ownerLookup = vi.fn().mockResolvedValue("owner");
    const file = { stream: { readable: true }, size: 12 };
    const fileService = {
      getMDPFiles: vi.fn().mockResolvedValue(file),
      getUserFile: vi
        .fn()
        .mockResolvedValueOnce("no-results")
        .mockResolvedValueOnce(file),
      getSimulationFigures: vi
        .fn()
        .mockResolvedValueOnce("no-figures")
        .mockResolvedValueOnce(file),
      getSimulationCommands: vi
        .fn()
        .mockResolvedValueOnce("no-commands")
        .mockResolvedValueOnce(file),
      getSimulationGromacsLogs: vi
        .fn()
        .mockResolvedValueOnce("no-logs")
        .mockResolvedValueOnce(file),
      getSimulationResults: vi
        .fn()
        .mockResolvedValueOnce("no-results")
        .mockResolvedValueOnce(file),
    };
    const module = await createModule({
      simulationService: { getSimulationOwnerUsername: ownerLookup },
      fileService,
    });
    const controller = module.get(SimulationController);
    const adminSession = createSession({
      user: { username: "admin", role: "admin" },
    }) as any;

    await expect(controller.getMDPFiles()).resolves.toBeDefined();
    await expect(controller.getUserFile("/tmp/a")).rejects.toBeInstanceOf(
      HttpException,
    );
    await expect(controller.getUserFile("/tmp/a")).resolves.toBeDefined();

    await expect(
      controller.getSimulationFigures(adminSession, "sim"),
    ).rejects.toBeInstanceOf(HttpException);
    await expect(
      controller.getSimulationFigures(adminSession, "sim"),
    ).resolves.toBeDefined();
    await expect(
      controller.getSimulationCommands(adminSession, "sim"),
    ).rejects.toBeInstanceOf(HttpException);
    await expect(
      controller.getSimulationCommands(adminSession, "sim"),
    ).resolves.toBeDefined();
    await expect(
      controller.getSimulationGromacsLogs(adminSession, "sim"),
    ).rejects.toBeInstanceOf(HttpException);
    await expect(
      controller.getSimulationGromacsLogs(adminSession, "sim"),
    ).resolves.toBeDefined();
    await expect(
      controller.getSimulationResults(adminSession, "sim" as any),
    ).rejects.toBeInstanceOf(HttpException);
    await expect(
      controller.getSimulationResults(adminSession, "sim" as any),
    ).resolves.toBeDefined();
  });

  it("throws not found when download owner lookup fails", async () => {
    const module = await createModule({
      simulationService: {
        getSimulationOwnerUsername: vi.fn().mockResolvedValue(null),
      },
      fileService: {},
    });
    const controller = module.get(SimulationController);
    const adminSession = createSession({
      user: { username: "admin", role: "admin" },
    }) as any;

    await expect(
      controller.getSimulationFigures(adminSession, "sim"),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      controller.getSimulationCommands(adminSession, "sim"),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      controller.getSimulationGromacsLogs(adminSession, "sim"),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      controller.getSimulationResults(adminSession, "sim" as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
