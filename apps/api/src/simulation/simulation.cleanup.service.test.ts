import { describe, expect, it, vi } from "vitest";

const { existsSync, rmSync } = vi.hoisted(() => ({
  existsSync: vi.fn(),
  rmSync: vi.fn(),
}));

vi.mock("fs", () => ({
  existsSync,
  rmSync,
}));

import { createPrismaStub } from "../test-utils/mocks.js";

import {
  getStorageExpiresAt,
  STORAGE_RETENTION_DAYS,
  SimulationCleanupService,
} from "./simulation.cleanup.service.js";

describe("getStorageExpiresAt", () => {
  it("uses createdAt for generated simulations", () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");

    const expiresAt = getStorageExpiresAt({
      status: "GENERATED",
      createdAt,
      endedAt: null,
    });

    const expected = new Date(createdAt);
    expected.setDate(expected.getDate() + STORAGE_RETENTION_DAYS);

    expect(expiresAt).toEqual(expected);
  });

  it("uses endedAt for terminal simulations", () => {
    const endedAt = new Date("2026-02-01T00:00:00.000Z");

    const expiresAt = getStorageExpiresAt({
      status: "COMPLETED",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      endedAt,
    });

    const expected = new Date(endedAt);
    expected.setDate(expected.getDate() + STORAGE_RETENTION_DAYS);

    expect(expiresAt).toEqual(expected);
  });

  it("returns null for terminal simulations without an end date", () => {
    expect(
      getStorageExpiresAt({
        status: "ERRORED",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        endedAt: null,
      }),
    ).toBeNull();
  });

  it("returns null for active simulations", () => {
    expect(
      getStorageExpiresAt({
        status: "RUNNING",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        endedAt: null,
      }),
    ).toBeNull();
  });
});

describe("SimulationCleanupService", () => {
  it("marks missing folders as deleted", async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-03T00:00:00.000Z"));
    existsSync.mockReturnValue(false);
    const prisma = createPrismaStub();
    prisma.simulation.findMany.mockResolvedValue([
      {
        id: "sim-1",
        status: "GENERATED",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        endedAt: null,
        storageDeletedAt: null,
        user: { username: "owner" },
      },
    ]);
    prisma.simulation.update.mockResolvedValue(undefined);
    const service = new SimulationCleanupService(prisma as any);

    await service.handleExpiredSimulations();

    expect(prisma.simulation.findMany).toHaveBeenCalled();
    expect(prisma.simulation.update).toHaveBeenCalledWith({
      where: { id: "sim-1" },
      data: { storageDeletedAt: new Date("2026-05-03T00:00:00.000Z") },
    });
    vi.useRealTimers();
  });

  it("deletes expired folders and records deletion time", async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-03T00:00:00.000Z"));
    existsSync.mockReturnValue(true);
    const prisma = createPrismaStub();
    prisma.simulation.findMany.mockResolvedValue([
      {
        id: "sim-2",
        status: "COMPLETED",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        endedAt: new Date("2026-01-15T00:00:00.000Z"),
        storageDeletedAt: null,
        user: { username: "owner" },
      },
    ]);
    prisma.simulation.update.mockResolvedValue(undefined);
    const service = new SimulationCleanupService(prisma as any);

    await service.handleExpiredSimulations();

    expect(rmSync).toHaveBeenCalledWith("/files/owner/sim-2", {
      recursive: true,
    });
    expect(prisma.simulation.update).toHaveBeenCalledWith({
      where: { id: "sim-2" },
      data: { storageDeletedAt: new Date("2026-05-03T00:00:00.000Z") },
    });
    vi.useRealTimers();
  });

  it("skips non-expired folders and tolerates deletion failures", async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-01T00:00:00.000Z"));
    existsSync.mockReturnValue(true);
    rmSync.mockImplementation(() => {
      throw new Error("rm failed");
    });
    const prisma = createPrismaStub();
    prisma.simulation.findMany.mockResolvedValue([
      {
        id: "sim-active",
        status: "GENERATED",
        createdAt: new Date("2026-01-15T00:00:00.000Z"),
        endedAt: null,
        storageDeletedAt: null,
        user: { username: "owner" },
      },
      {
        id: "sim-fail",
        status: "COMPLETED",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        endedAt: new Date("2025-12-01T00:00:00.000Z"),
        storageDeletedAt: null,
        user: { username: "owner" },
      },
    ]);
    prisma.simulation.update.mockResolvedValue(undefined);
    const service = new SimulationCleanupService(prisma as any);

    await service.handleExpiredSimulations();

    expect(prisma.simulation.update).not.toHaveBeenCalledWith({
      where: { id: "sim-active" },
      data: expect.anything(),
    });
    expect(prisma.simulation.update).not.toHaveBeenCalledWith({
      where: { id: "sim-fail" },
      data: expect.anything(),
    });
    vi.useRealTimers();
  });
});
