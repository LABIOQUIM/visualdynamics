import * as fs from "node:fs";

import { beforeEach, describe, expect, it, vi } from "vitest";

const { runCommand } = vi.hoisted(() => ({
  runCommand: vi.fn(),
}));

vi.mock("./runCommand.js", () => ({
  runCommand,
}));

import { executeCommands } from "./executeCommands.js";

describe("executeCommands", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writes step markers and runs executable commands", async () => {
    const appendFile = vi
      .spyOn(fs.promises, "appendFile")
      .mockResolvedValue(undefined);
    runCommand.mockResolvedValue({ pid: 1, returncode: 0 });

    await executeCommands(
      ["# step one", "gmx mdrun", "", "# step two"],
      "/tmp/steps.txt",
      "/tmp/log.txt",
    );

    expect(appendFile).toHaveBeenNthCalledWith(
      1,
      "/tmp/steps.txt",
      "# step one\n",
    );
    expect(appendFile).toHaveBeenNthCalledWith(
      2,
      "/tmp/steps.txt",
      "# step two\n",
    );
    expect(runCommand).toHaveBeenCalledTimes(1);
    expect(runCommand).toHaveBeenCalledWith("gmx mdrun", "/tmp/log.txt", undefined, undefined);
  });

  it("throws when a command exits with a non-zero return code", async () => {
    vi.spyOn(fs.promises, "appendFile").mockResolvedValue(undefined);
    runCommand.mockResolvedValue({ pid: 1, returncode: 1 });

    await expect(
      executeCommands(["gmx mdrun"], "/tmp/steps.txt", "/tmp/log.txt"),
    ).rejects.toThrow("Command gmx mdrun exited with non-zero return code");
  });

  it("logs and rethrows step write failures", async () => {
    const writeError = new Error("disk full");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.spyOn(fs.promises, "appendFile").mockRejectedValue(writeError);

    await expect(
      executeCommands(["# step one"], "/tmp/steps.txt", "/tmp/log.txt"),
    ).rejects.toBe(writeError);
    expect(errorSpy).toHaveBeenCalledWith("Error writing step:", writeError);

    errorSpy.mockRestore();
  });
});
