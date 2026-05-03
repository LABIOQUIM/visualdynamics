import { describe, expect, it, vi } from "vitest";

import { createPrismaStub } from "../test-utils/mocks.js";

import { FeatureFlagService } from "./feature-flag.service.js";

describe("FeatureFlagService", () => {
  it("delegates CRUD methods to prisma", async () => {
    const prisma = createPrismaStub();
    prisma.featureFlag.findMany.mockResolvedValue([{ key: "a" }]);
    prisma.featureFlag.findUnique.mockResolvedValue({ key: "a" });
    prisma.featureFlag.create.mockResolvedValue({ key: "a" });
    prisma.featureFlag.update.mockResolvedValue({ key: "a", enabled: false });
    prisma.featureFlag.delete.mockResolvedValue({ key: "a" });
    const service = new FeatureFlagService(prisma as any);
    const createBody = {
      key: "a",
      type: "BOOLEAN" as any,
      enabled: true,
      defaultVariant: "on",
      variants: { on: true },
    };

    await expect(service.findAll()).resolves.toEqual([{ key: "a" }]);
    await expect(service.findByKey("a")).resolves.toEqual({ key: "a" });
    await expect(service.create(createBody)).resolves.toEqual({ key: "a" });
    await expect(service.update("a", { enabled: false })).resolves.toEqual({
      key: "a",
      enabled: false,
    });
    await expect(service.delete("a")).resolves.toEqual({ key: "a" });

    expect(prisma.featureFlag.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
    });
    expect(prisma.featureFlag.findUnique).toHaveBeenCalledWith({
      where: { key: "a" },
    });
    expect(prisma.featureFlag.create).toHaveBeenCalledWith({
      data: createBody,
    });
    expect(prisma.featureFlag.update).toHaveBeenCalledWith({
      where: { key: "a" },
      data: { enabled: false },
    });
    expect(prisma.featureFlag.delete).toHaveBeenCalledWith({
      where: { key: "a" },
    });
  });

  it("maps enabled flags for client consumption", async () => {
    const prisma = createPrismaStub();
    prisma.featureFlag.findMany.mockResolvedValue([
      {
        key: "maintenance-mode",
        type: "BOOLEAN",
        enabled: true,
        defaultVariant: "on",
        variants: { on: true },
      },
      {
        key: "theme",
        type: "STRING",
        enabled: true,
        defaultVariant: "blue",
        variants: { blue: "blue" },
      },
    ]);
    const service = new FeatureFlagService(prisma as any);

    await expect(service.getAllFlagsForClient()).resolves.toEqual({
      "maintenance-mode": {
        type: "BOOLEAN",
        defaultVariant: "on",
        variants: { on: true },
        disabled: false,
      },
      theme: {
        type: "STRING",
        defaultVariant: "blue",
        variants: { blue: "blue" },
        disabled: false,
      },
    });
    expect(prisma.featureFlag.findMany).toHaveBeenCalledWith({
      where: { enabled: true },
    });
  });
});
