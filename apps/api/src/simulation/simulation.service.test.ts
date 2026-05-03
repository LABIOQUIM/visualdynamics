import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createPrismaStub, createQueueStub } from "../test-utils/mocks.js";

const { fsExistsSync, fsReadFileSync, readFileDataMock } = vi.hoisted(() => ({
  fsExistsSync: vi.fn(),
  fsReadFileSync: vi.fn(),
  readFileDataMock: vi.fn(),
}));

vi.mock("fs", () => ({
  existsSync: fsExistsSync,
  readFileSync: fsReadFileSync,
}));

vi.mock("../utils/readFileData.js", () => ({
  readFileData: readFileDataMock,
}));

import { SimulationService } from "./simulation.service.js";

function createSimulationRecord(ownerUsername: string, ligands = [] as any[]) {
  return {
    id: "sim-1",
    errorCause: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    moleculeName: "Protein",
    startedAt: null,
    endedAt: null,
    status: "GENERATED",
    type: "APO",
    storageDeletedAt: null,
    ligands,
    user: {
      username: ownerUsername,
    },
  };
}

class TestSimulationService extends SimulationService {
  private readonly existingPaths = new Set<string>();
  private readonly fileContents = new Map<string, string[]>();

  addPath(path: string) {
    this.existingPaths.add(path);
  }

  setFile(path: string, contents: string[]) {
    this.fileContents.set(path, contents);
  }

  protected override pathExists(path: string) {
    return this.existingPaths.has(path);
  }

  protected override readStoredFile(path: string) {
    return this.fileContents.get(path) ?? [];
  }
}

class ExposedSimulationService extends SimulationService {
  exposedGetSimulationStoragePaths(username: string, simulationId: string) {
    return this.getSimulationStoragePaths(username, simulationId);
  }

  exposedPathExists(path: string) {
    return this.pathExists(path);
  }

  exposedReadStoredFile(path: string, preserveWhitespace: boolean) {
    return this.readStoredFile(path, preserveWhitespace);
  }
}

function createService(
  simulation: ReturnType<typeof createSimulationRecord> | null = null,
  queueOverrides: Record<string, any> = {},
) {
  const prisma = createPrismaStub();
  const queue = createQueueStub(queueOverrides);
  prisma.simulation.findFirst.mockResolvedValue(simulation);

  return {
    prisma,
    queue,
    service: new TestSimulationService(queue as any, prisma as any),
  };
}

describe("SimulationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fsExistsSync.mockReturnValue(false);
    fsReadFileSync.mockReset();
    readFileDataMock.mockReset();
    vi.spyOn(process, "kill").mockImplementation(() => true);
  });

  it("returns stored simulation details for the owner with queue state and ligands", async () => {
    const simulation = createSimulationRecord("owner", [
      { position: 0 },
      { position: 1 },
      { position: 2 },
    ]);
    const { service } = createService(simulation, {
      getJobs: vi
        .fn()
        .mockResolvedValueOnce([
          { id: "job-1", data: { simulationId: "sim-1" } },
          { id: "job-2", data: { simulationId: "sim-2" } },
        ])
        .mockResolvedValueOnce([
          { id: "job-3", data: { simulationId: "sim-3" } },
          { id: "job-1", data: { simulationId: "sim-1" } },
        ])
        .mockResolvedValueOnce([
          { id: "job-1", data: { simulationId: "sim-1" } },
        ]),
    });
    service.addPath("/files/owner/sim-1");
    service.addPath("/files/owner/sim-1/steps.txt");
    service.addPath("/files/owner/sim-1/run/logs/gmx.log");
    service.addPath("/files/owner/sim-1/run/originalMacromolecule.pdb");
    service.addPath("/files/owner/sim-1/run/originalLigand.pdb");
    service.addPath("/files/owner/sim-1/run/originalLigand_1.pdb");
    service.setFile("/files/owner/sim-1/steps.txt", ["step"]);
    service.setFile("/files/owner/sim-1/run/logs/gmx.log", ["log"]);
    service.setFile("/files/owner/sim-1/run/originalMacromolecule.pdb", [
      "ATOM",
    ]);
    service.setFile("/files/owner/sim-1/run/originalLigand.pdb", ["LIG0"]);
    service.setFile("/files/owner/sim-1/run/originalLigand_1.pdb", ["LIG1"]);

    const result = await service.getSimulationDetails("owner", false, "sim-1");

    expect(result).toMatchObject({
      isStored: true,
      isActive: true,
      queuePosition: 1,
      jobId: "job-1",
      stepData: ["step"],
      logData: ["log"],
      molecules: {
        macromolecule: "ATOM",
        ligands: ["LIG0", "LIG1"],
      },
    });
  });

  it("returns admin access details and null for missing simulations", async () => {
    const { service } = createService(createSimulationRecord("owner"));
    service.addPath("/files/owner/sim-1");

    await expect(
      service.getSimulationDetails("admin", true, "sim-1"),
    ).resolves.toMatchObject({ isStored: true });
    await expect(
      createService(null).service.getSimulationDetails("owner", false, "sim-1"),
    ).resolves.toBeNull();
    await expect(
      createService(null).service.getSimulationOwnerUsername(
        "sim-1",
        "owner",
        false,
      ),
    ).resolves.toBeNull();
  });

  it("handles simulations with null ligands", async () => {
    const { service } = createService({
      ...createSimulationRecord("owner"),
      ligands: null,
    } as any);

    await expect(
      service.getSimulationDetails("owner", false, "sim-1"),
    ).resolves.toMatchObject({
      molecules: { ligands: [] },
    });
  });

  it("rejects non-admin access to another user's simulation", async () => {
    const { service } = createService(createSimulationRecord("owner"));

    await expect(
      service.getSimulationDetails("intruder", false, "sim-1"),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("resolves the owner username for download paths", async () => {
    const { service } = createService(createSimulationRecord("owner"));

    await expect(
      service.getSimulationOwnerUsername("sim-1", "admin", true),
    ).resolves.toBe("owner");
  });

  it("returns paginated user and management simulations with storage expiry", async () => {
    const { prisma, service } = createService();
    const record = {
      id: "sim-1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      status: "COMPLETED",
    };
    prisma.$transaction
      .mockResolvedValueOnce([[record], 1])
      .mockResolvedValueOnce([[{ ...record, user: { username: "owner" } }], 1]);

    const userResult = await service.getUserSimulations("user-1", 5, 2);
    const mgmtResult = await service.getMgmtSimulations("ignored", 5, 2);

    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
    expect(userResult.total).toBe(1);
    expect(userResult.records[0]).toHaveProperty("storageExpiresAt");
    expect(mgmtResult.total).toBe(1);
    expect(mgmtResult.records[0]).toHaveProperty("storageExpiresAt");
  });

  it("cancels queued simulations and running simulations with jobs", async () => {
    const { prisma, queue, service } = createService();
    prisma.simulation.findUnique
      .mockResolvedValueOnce({
        id: "sim-1",
        userId: "user-1",
        status: "QUEUED",
        user: { username: "owner" },
      })
      .mockResolvedValueOnce({
        id: "sim-2",
        userId: "user-1",
        status: "RUNNING",
        user: { username: "owner" },
      });
    const remove = vi.fn().mockResolvedValue(undefined);
    queue.getJobs
      .mockResolvedValueOnce([{ data: { simulationId: "sim-1" }, remove }])
      .mockResolvedValueOnce([{ data: { simulationId: "sim-2" }, remove }]);
    fsExistsSync.mockReturnValue(true);
    fsReadFileSync.mockImplementation((path: string) => {
      if (path === "/files/owner/sim-2/processing.pid") {
        return "123:lock";
      }
      if (path === "/proc/123/stat") {
        return "123 (node) S 0 777 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0";
      }
      return "999 (node) S 0 888 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0";
    });

    await expect(
      service.cancelSimulation("sim-1", "user-1", false),
    ).resolves.toEqual({ status: "canceled" });
    await expect(
      service.cancelSimulation("sim-2", "user-1", false),
    ).resolves.toEqual({ status: "canceled" });

    expect(remove).toHaveBeenCalledTimes(2);
    expect(process.kill).toHaveBeenCalledWith(-777, "SIGTERM");
    expect(prisma.simulation.update).toHaveBeenCalledTimes(2);
  });

  it("rejects invalid cancel attempts and tolerates missing pid file data", async () => {
    const { prisma, queue, service } = createService();
    prisma.simulation.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "sim-1",
        userId: "owner-id",
        status: "QUEUED",
        user: { username: "owner" },
      })
      .mockResolvedValueOnce({
        id: "sim-1",
        userId: "user-1",
        status: "COMPLETED",
        user: { username: "owner" },
      })
      .mockResolvedValueOnce({
        id: "sim-2",
        userId: "user-1",
        status: "RUNNING",
        user: { username: "owner" },
      });
    queue.getJobs.mockResolvedValue([]);
    fsExistsSync.mockReturnValue(true);
    fsReadFileSync.mockImplementation(() => {
      throw new Error("gone");
    });

    await expect(
      service.cancelSimulation("sim-missing", "user-1", false),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.cancelSimulation("sim-1", "user-1", false),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      service.cancelSimulation("sim-1", "user-1", true),
    ).rejects.toBeInstanceOf(ConflictException);
    await expect(
      service.cancelSimulation("sim-2", "user-1", false),
    ).resolves.toEqual({ status: "canceled" });
    expect(prisma.simulation.update).toHaveBeenCalledWith({
      where: { id: "sim-2" },
      data: { status: "CANCELED", endedAt: expect.any(Date) },
    });
  });

  it("cancels running simulations when no pid file exists", async () => {
    const { prisma, queue, service } = createService();
    prisma.simulation.findUnique.mockResolvedValueOnce({
      id: "sim-3",
      userId: "user-1",
      status: "RUNNING",
      user: { username: "owner" },
    });
    queue.getJobs.mockResolvedValue([]);
    fsExistsSync.mockReturnValue(false);

    await expect(
      service.cancelSimulation("sim-3", "user-1", false),
    ).resolves.toEqual({ status: "canceled" });
    expect(fsReadFileSync).not.toHaveBeenCalled();
  });

  it("updates simulations without writing the body id field", async () => {
    const { prisma, service } = createService();

    await service.adminUpdateSimulation("sim-1", {
      id: "ignored",
      status: "COMPLETED" as never,
    } as never);

    expect(prisma.simulation.update).toHaveBeenCalledWith({
      where: { id: "sim-1" },
      data: { status: "COMPLETED" },
    });
  });

  it("imports simulations and reports row-level errors", async () => {
    const { prisma, service } = createService();
    prisma.user.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "user-2" })
      .mockResolvedValueOnce({ id: "user-3" })
      .mockResolvedValueOnce({ id: "user-4" });
    prisma.simulation.findFirst
      .mockResolvedValueOnce({ id: "existing-sim" })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    prisma.simulation.create
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce("db fail");

    const result = await service.adminImportSimulations([
      {
        user_name: "missing-user",
        molecule_name: "Mol 1",
        type: "APO",
        status: "COMPLETED",
      },
      {
        id: "existing-sim",
        user_name: "user-2",
        molecule_name: "Mol 2",
        type: "APO",
        status: "COMPLETED",
      },
      {
        id: "new-sim",
        user_name: "user-3",
        molecule_name: "Mol 3",
        type: "ACPYPE",
        status: "ERRORED",
        started_at: "2026-01-01T00:00:00.000Z",
        ended_at: "2026-01-02T00:00:00.000Z",
        error_cause: "boom",
        created_at: "2026-01-03T00:00:00.000Z",
        ligand_itp_name: "lig.itp",
        ligand_pdb_name: "lig.pdb",
      },
      {
        user_name: "user-4",
        molecule_name: "Mol 4",
        type: "APO",
        status: "COMPLETED",
      },
    ]);

    expect(result.imported).toBe(1);
    expect(result.errors).toEqual([
      "User not found: missing-user",
      "Simulation already exists: existing-sim",
      "Row Mol 4: db fail",
    ]);
    expect(prisma.simulation.create).toHaveBeenCalledWith({
      data: {
        id: "new-sim",
        userId: "user-3",
        moleculeName: "Mol 3",
        type: "ACPYPE",
        status: "ERRORED",
        startedAt: new Date("2026-01-01T00:00:00.000Z"),
        endedAt: new Date("2026-01-02T00:00:00.000Z"),
        errorCause: "boom",
        createdAt: new Date("2026-01-03T00:00:00.000Z"),
        ligands: {
          create: [
            {
              ligandITPName: "lig.itp",
              ligandPDBName: "lig.pdb",
              position: 0,
            },
          ],
        },
      },
    });
  });

  it("reports import errors using row id when present", async () => {
    const { prisma, service } = createService();
    prisma.user.findFirst.mockResolvedValueOnce({ id: "user-9" });
    prisma.simulation.findFirst.mockResolvedValueOnce(null);
    prisma.simulation.create.mockRejectedValueOnce(new Error("broken row"));

    await expect(
      service.adminImportSimulations([
        {
          id: "sim-row-9",
          user_name: "user-9",
          molecule_name: "Mol 9",
          type: "APO",
          status: "COMPLETED",
        },
      ]),
    ).resolves.toEqual({
      imported: 0,
      errors: ["Row sim-row-9: broken row"],
    });
  });

  it("returns queue info counts and jobs", async () => {
    const { queue, service } = createService();
    queue.getActiveCount.mockResolvedValue(1);
    queue.getFailedCount.mockResolvedValue(2);
    queue.getDelayedCount.mockResolvedValue(3);
    queue.getWaitingCount.mockResolvedValue(4);
    queue.getCompletedCount.mockResolvedValue(5);
    queue.getJobs.mockResolvedValue([{ id: "job-1" }]);

    await expect(service.getQueueInfo()).resolves.toEqual({
      active: 1,
      failed: 2,
      paused: 0,
      delayed: 3,
      waiting: 4,
      completed: 5,
      jobs: [{ id: "job-1" }],
    });
  });

  it("uses filesystem wrapper methods and storage path builder", () => {
    const prisma = createPrismaStub();
    const queue = createQueueStub();
    const service = new ExposedSimulationService(queue as any, prisma as any);
    fsExistsSync.mockReturnValueOnce(true);
    readFileDataMock.mockReturnValueOnce(["stored"]);

    expect(service.exposedGetSimulationStoragePaths("owner", "sim-1")).toEqual({
      simulationFolderPath: "/files/owner/sim-1",
      logFilePath: "/files/owner/sim-1/run/logs/gmx.log",
      molFilePath: "/files/owner/sim-1/run/originalMacromolecule.pdb",
      stepFilePath: "/files/owner/sim-1/steps.txt",
    });
    expect(service.exposedPathExists("/tmp/test")).toBe(true);
    expect(service.exposedReadStoredFile("/tmp/file", false)).toEqual([
      "stored",
    ]);
    expect(readFileDataMock).toHaveBeenCalledWith("/tmp/file", false);
  });
});
