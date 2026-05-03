import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { describe, expect, it, vi } from "vitest";

import { createSession } from "../test-utils/session.js";

import { FeatureFlagController } from "./feature-flag.controller.js";
import { FeatureFlagService } from "./feature-flag.service.js";

function createController(featureFlagService: Partial<FeatureFlagService>) {
  return Test.createTestingModule({
    controllers: [FeatureFlagController],
    providers: [
      {
        provide: FeatureFlagService,
        useValue: featureFlagService,
      },
    ],
  }).compile();
}

describe("FeatureFlagController", () => {
  it("returns enabled flags for client bootstrap", async () => {
    const flags = { "simulation-submission": { disabled: false } };
    const module = await createController({
      getAllFlagsForClient: vi.fn().mockResolvedValue(flags),
    });

    await expect(
      module.get(FeatureFlagController).getClientFlags(),
    ).resolves.toEqual(flags);
  });

  it("blocks non-admin users from listing flags", async () => {
    const module = await createController({
      findAll: vi.fn(),
    });

    await expect(
      module.get(FeatureFlagController).findAll(createSession() as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("blocks non-admin users from reading and mutating flags", async () => {
    const module = await createController({
      findByKey: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    });
    const controller = module.get(FeatureFlagController);
    const session = createSession() as any;

    await expect(controller.findByKey("a", session)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(
      controller.create(
        {
          key: "a",
          type: "BOOLEAN",
          enabled: true,
          defaultVariant: "on",
          variants: { on: true },
        } as any,
        session,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      controller.update("a", { enabled: false }, session),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(controller.remove("a", session)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it("returns all flags for admins", async () => {
    const flags = [{ key: "maintenance-mode" }];
    const module = await createController({
      findAll: vi.fn().mockResolvedValue(flags),
    });

    await expect(
      module
        .get(FeatureFlagController)
        .findAll(createSession({ user: { role: "admin" } }) as any),
    ).resolves.toEqual(flags);
  });

  it("throws not found when an admin requests a missing flag", async () => {
    const module = await createController({
      findByKey: vi.fn().mockResolvedValue(null),
    });

    await expect(
      module
        .get(FeatureFlagController)
        .findByKey(
          "missing",
          createSession({ user: { role: "admin" } }) as any,
        ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("creates, updates, and deletes flags for admins", async () => {
    const create = vi.fn().mockResolvedValue({ key: "a" });
    const update = vi.fn().mockResolvedValue({ key: "a", enabled: false });
    const remove = vi.fn().mockResolvedValue({ key: "a" });
    const module = await createController({
      create,
      update,
      delete: remove,
      findByKey: vi.fn().mockResolvedValue({ key: "a" }),
    });
    const controller = module.get(FeatureFlagController);
    const session = createSession({ user: { role: "admin" } }) as any;
    const createBody = {
      key: "a",
      type: "BOOLEAN",
      enabled: true,
      defaultVariant: "on",
      variants: { on: true },
    };
    const updateBody = {
      enabled: false,
    };

    await expect(controller.findByKey("a", session)).resolves.toEqual({
      key: "a",
    });
    await expect(
      controller.create(createBody as any, session),
    ).resolves.toEqual({
      key: "a",
    });
    await expect(controller.update("a", updateBody, session)).resolves.toEqual({
      key: "a",
      enabled: false,
    });
    await expect(controller.remove("a", session)).resolves.toEqual({
      key: "a",
    });

    expect(create).toHaveBeenCalledWith(createBody);
    expect(update).toHaveBeenCalledWith("a", updateBody);
    expect(remove).toHaveBeenCalledWith("a");
  });
});
