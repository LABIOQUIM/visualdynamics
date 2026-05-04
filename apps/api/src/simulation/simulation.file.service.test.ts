import { describe, expect, it, vi } from "vitest";

const {
  createReadStream,
  existsSync,
  readdirSync,
  rmSync,
  statSync,
  execAsync,
  cwd,
  tmpdir,
  getFilesRoot,
} = vi.hoisted(() => ({
  createReadStream: vi.fn((path: string) => ({
    path,
    on: vi.fn(),
  })),
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
  rmSync: vi.fn(),
  statSync: vi.fn(),
  execAsync: vi.fn(),
  cwd: vi.fn(() => "/repo"),
  tmpdir: vi.fn(() => "/tmp"),
  getFilesRoot: vi.fn(() => "/files-root"),
}));

vi.mock("fs", () => ({
  createReadStream,
  existsSync,
  readdirSync,
  rmSync,
  statSync,
}));

vi.mock("child_process", () => ({
  exec: vi.fn(),
}));

vi.mock("util", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    promisify: () => execAsync,
  };
});

vi.mock("process", () => ({
  cwd,
}));

vi.mock("os", () => ({
  tmpdir,
}));

vi.mock("../utils/filesRoot.js", () => ({
  getFilesRoot,
}));

import { SimulationFileService } from "./simulation.file.service.js";

describe("SimulationFileService", () => {
  it("handles figures downloads for missing, empty, and populated folders", async () => {
    const service = new SimulationFileService();
    existsSync
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);
    readdirSync
      .mockReturnValueOnce([])
      .mockReturnValueOnce(["figure.xvg", "figures.zip"]);
    statSync.mockReturnValue({ size: 12 });
    execAsync.mockResolvedValue(undefined);

    await expect(service.getSimulationFigures("owner", "sim")).resolves.toBe(
      "no-figures",
    );
    await expect(service.getSimulationFigures("owner", "sim")).resolves.toBe(
      "no-figures",
    );
    await expect(service.getSimulationFigures("owner", "sim")).resolves.toEqual(
      {
        stream: expect.objectContaining({
          path: "/files-root/owner/sim/figures/figures.zip",
        }),
        size: 12,
      },
    );

    expect(execAsync).toHaveBeenNthCalledWith(1, "cp *.xvg ../figures", {
      cwd: "/files-root/owner/sim/run",
    });
    expect(execAsync).toHaveBeenLastCalledWith("zip -r figures.zip *", {
      cwd: "/files-root/owner/sim/figures",
    });
  });

  it("zips MDP files from the static directory", async () => {
    const service = new SimulationFileService();
    statSync.mockReturnValue({ size: 15 });
    execAsync.mockResolvedValue(undefined);
    vi.spyOn(Date, "now").mockReturnValue(6789);

    await expect(service.getMDPFiles()).resolves.toEqual({
      stream: expect.objectContaining({
        path: expect.stringMatching(/^\/tmp\/mdpfiles-\d+-6789\.zip$/),
      }),
      size: 15,
    });
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringMatching(/^zip -r \/tmp\/mdpfiles-\d+-6789\.zip \*\.mdp$/),
      {
        cwd: "/repo/static/mdp",
      },
    );
  });

  it("returns commands, logs, results, and arbitrary files when present", async () => {
    const service = new SimulationFileService();
    existsSync.mockReturnValue(true);
    readdirSync.mockReturnValue(["a"]);
    statSync.mockReturnValue({ size: 20 });
    execAsync.mockResolvedValue(undefined);

    await expect(
      service.getSimulationCommands("owner", "sim"),
    ).resolves.toEqual({
      stream: expect.objectContaining({
        path: "/files-root/owner/sim/commands.txt",
      }),
      size: 20,
    });
    await expect(
      service.getSimulationGromacsLogs("owner", "sim"),
    ).resolves.toEqual({
      stream: expect.objectContaining({
        path: "/files-root/owner/sim/run/logs/gmx.log",
      }),
      size: 20,
    });
    await expect(service.getSimulationResults("owner", "sim")).resolves.toEqual(
      {
        stream: expect.objectContaining({
          path: "/files-root/owner/sim/run/results.zip",
        }),
        size: 20,
      },
    );
    await expect(service.getUserFile("/tmp/file")).resolves.toEqual({
      stream: expect.objectContaining({ path: "/tmp/file" }),
      size: 20,
    });
  });

  it("returns missing statuses for absent command, log, results, and arbitrary files", async () => {
    const service = new SimulationFileService();
    existsSync.mockReturnValue(false);

    await expect(service.getSimulationCommands("owner", "sim")).resolves.toBe(
      "no-commands",
    );
    await expect(
      service.getSimulationGromacsLogs("owner", "sim"),
    ).resolves.toBe("no-logs");
    await expect(service.getSimulationResults("owner", "sim")).resolves.toBe(
      "no-results",
    );
    await expect(service.getUserFile("/tmp/file")).resolves.toBe("no-results");
  });

  it("treats empty run folders as missing results", async () => {
    const service = new SimulationFileService();
    existsSync.mockReturnValue(true);
    readdirSync.mockReturnValue([]);

    await expect(service.getSimulationResults("owner", "sim")).resolves.toBe(
      "no-results",
    );
  });
});
