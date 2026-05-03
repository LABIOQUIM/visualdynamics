import assert from "node:assert/strict";
import test from "node:test";

import { UnauthorizedException } from "@nestjs/common";

import { SimulationService } from "../src/simulation/simulation.service.js";

function createSimulationRecord(ownerUsername: string) {
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
    ligands: [],
    user: {
      username: ownerUsername,
    },
  };
}

class TestSimulationService extends SimulationService {
  private readonly existingPaths = new Set<string>();
  private readonly fileContents = new Map<string, string[]>();

  constructor(simulation: ReturnType<typeof createSimulationRecord> | null) {
    super(
      {
        getJobs: async () => [],
      } as any,
      {
        simulation: {
          findFirst: async () => simulation,
        },
      } as any,
    );
  }

  addPath(path: string) {
    this.existingPaths.add(path);
  }

  protected override pathExists(path: string) {
    return this.existingPaths.has(path);
  }

  protected override readStoredFile(path: string) {
    return this.fileContents.get(path) ?? [];
  }
}

test("owner opening own stored simulation returns isStored true", async () => {
  const service = new TestSimulationService(createSimulationRecord("owner"));
  service.addPath("/files/owner/sim-1");

  const result = await service.getSimulationDetails("owner", false, "sim-1");

  assert.equal(result?.isStored, true);
});

test("admin opening another user's stored simulation returns isStored true", async () => {
  const service = new TestSimulationService(createSimulationRecord("owner"));
  service.addPath("/files/owner/sim-1");

  const result = await service.getSimulationDetails("admin", true, "sim-1");

  assert.equal(result?.isStored, true);
});

test("non-owner non-admin cannot read another user's simulation", async () => {
  const service = new TestSimulationService(createSimulationRecord("owner"));

  await assert.rejects(
    () => service.getSimulationDetails("intruder", false, "sim-1"),
    UnauthorizedException,
  );
});

test("admin owner lookup for downloads resolves the simulation owner's username", async () => {
  const service = new TestSimulationService(createSimulationRecord("owner"));

  const ownerUsername = await service.getSimulationOwnerUsername(
    "sim-1",
    "admin",
    true,
  );

  assert.equal(ownerUsername, "owner");
});
