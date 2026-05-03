import { describe, expect, it, vi } from "vitest";

import {
  buildImportedLigands,
  buildSimulationStoragePaths,
  getSimulationQueueState,
  parseProcessGroupIdFromStat,
  parseSimulationProcessPid,
  readSimulationStoredArtifacts,
  terminateSimulationProcess,
  withStorageExpiry,
} from "./simulation.service.helpers.js";

function procStat(pgid: number) {
  return `999 (node) S 0 ${pgid} 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0`;
}

describe("simulation.service helpers", () => {
  it("builds simulation storage paths", () => {
    expect(buildSimulationStoragePaths("/files", "alice", "sim-1")).toEqual({
      simulationFolderPath: "/files/alice/sim-1",
      logFilePath: "/files/alice/sim-1/run/logs/gmx.log",
      molFilePath: "/files/alice/sim-1/run/originalMacromolecule.pdb",
      stepFilePath: "/files/alice/sim-1/steps.txt",
    });
  });

  it("derives queue state from queue job lists", () => {
    expect(
      getSimulationQueueState(
        "sim-1",
        [
          { id: "job-1", data: { simulationId: "sim-1" } },
          { id: null, data: { simulationId: "sim-2" } },
        ],
        [
          { id: "job-3", data: { simulationId: "sim-3" } },
          { id: "job-1", data: { simulationId: "sim-1" } },
        ],
        [{ id: "job-4", data: { simulationId: "sim-1" } }],
      ),
    ).toEqual({
      jobId: "job-1",
      queuePosition: 1,
      isActive: true,
    });

    expect(getSimulationQueueState("missing", [], [], [])).toEqual({
      jobId: "-1",
      queuePosition: -1,
      isActive: false,
    });
  });

  it("reads stored artifacts with ligand fallback behavior", () => {
    const files = new Map<string, string[]>([
      ["/files/alice/sim-1/steps.txt", ["step-1"]],
      ["/files/alice/sim-1/run/logs/gmx.log", ["log-1"]],
      ["/files/alice/sim-1/run/originalMacromolecule.pdb", ["ATOM 1"]],
      ["/files/alice/sim-1/run/originalLigand.pdb", ["LIG 0"]],
      ["/files/alice/sim-1/run/originalLigand_1.pdb", ["LIG 1"]],
    ]);

    const result = readSimulationStoredArtifacts(
      buildSimulationStoragePaths("/files", "alice", "sim-1"),
      [{ position: 0 }, { position: 1 }, { position: 2 }],
      (path) => path === "/files/alice/sim-1" || files.has(path),
      (path) => files.get(path) ?? [],
    );

    expect(result).toEqual({
      isStored: true,
      stepData: ["step-1"],
      logData: ["log-1"],
      molecules: {
        macromolecule: "ATOM 1",
        ligands: ["LIG 0", "LIG 1"],
      },
    });
  });

  it("returns empty stored artifacts when files are absent", () => {
    expect(
      readSimulationStoredArtifacts(
        buildSimulationStoragePaths("/files", "alice", "sim-2"),
        [{ position: 0 }],
        () => false,
        () => ["unused"],
      ),
    ).toEqual({
      isStored: false,
      stepData: [],
      logData: [],
      molecules: {
        macromolecule: null,
        ligands: [],
      },
    });
  });

  it("parses process ids and process groups", () => {
    expect(parseSimulationProcessPid("1234:abcd")).toBe(1234);
    expect(parseSimulationProcessPid("1234")).toBe(1234);
    expect(parseSimulationProcessPid("bad")).toBeNull();
    expect(parseSimulationProcessPid("0")).toBeNull();

    expect(parseProcessGroupIdFromStat(procStat(777))).toBe(777);
    expect(parseProcessGroupIdFromStat(procStat(0))).toBeNull();
  });

  it("terminates simulation processes by process group or pid fallback", () => {
    const kill = vi.fn();

    terminateSimulationProcess(
      123,
      999,
      (pid) => (pid === 123 ? procStat(777) : procStat(888)),
      kill,
    );
    expect(kill).toHaveBeenCalledWith(-777, "SIGTERM");

    const fallbackKill = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error("group fail");
      })
      .mockImplementationOnce(() => undefined);
    terminateSimulationProcess(
      123,
      999,
      (pid) => (pid === 123 ? procStat(777) : procStat(888)),
      fallbackKill,
    );
    expect(fallbackKill).toHaveBeenNthCalledWith(1, -777, "SIGTERM");
    expect(fallbackKill).toHaveBeenNthCalledWith(2, 123, "SIGTERM");

    const sameGroupKill = vi.fn();
    terminateSimulationProcess(123, 999, () => procStat(777), sameGroupKill);
    expect(sameGroupKill).toHaveBeenCalledWith(123, "SIGTERM");
  });

  it("builds imported ligands only when both names exist", () => {
    expect(
      buildImportedLigands({
        ligand_itp_name: "lig.itp",
        ligand_pdb_name: "lig.pdb",
      }),
    ).toEqual([
      {
        ligandITPName: "lig.itp",
        ligandPDBName: "lig.pdb",
        position: 0,
      },
    ]);
    expect(buildImportedLigands({ ligand_itp_name: "lig.itp" })).toEqual([]);
    expect(buildImportedLigands({ ligand_pdb_name: "lig.pdb" })).toEqual([]);
  });

  it("adds storage expiry to records", () => {
    const record = { id: "sim-1", createdAt: new Date(), status: "COMPLETED" };
    const storageExpiresAt = new Date("2027-01-01T00:00:00.000Z");

    expect(withStorageExpiry(record, () => storageExpiresAt)).toEqual({
      ...record,
      storageExpiresAt,
    });
  });
});
