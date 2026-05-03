import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { PassThrough } from "node:stream";

import { afterEach, describe, expect, it, vi } from "vitest";

describe("runCommand", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("runs a simple command and appends output to the log file", async () => {
    const dir = mkdtempSync(join(tmpdir(), "visualdynamics-command-"));
    tempDirs.push(dir);
    const logFile = join(dir, "command.log");

    const { runCommand } = await import("./runCommand.js");
    const result = await runCommand("printf hello", logFile);

    expect(result.returncode).toBe(0);
    expect(result.pid).toBeGreaterThan(0);
    expect(readFileSync(logFile, "utf-8")).toContain("hello");
  });

  it("uses shell execution for redirect commands", async () => {
    const dir = mkdtempSync(join(tmpdir(), "visualdynamics-command-"));
    tempDirs.push(dir);
    const logFile = join(dir, "command.log");
    const redirectedFile = join(dir, "redirected.txt");

    const { runCommand } = await import("./runCommand.js");
    const result = await runCommand(
      `printf redirected > ${redirectedFile}`,
      logFile,
    );

    expect(result.returncode).toBe(0);
    expect(readFileSync(redirectedFile, "utf-8")).toBe("redirected");
  });

  it("rejects when appending the command to the log file fails", async () => {
    vi.resetModules();
    const appendFile = vi.fn((_path, _data, cb) =>
      cb(new Error("append failed")),
    );
    const createWriteStream = vi.fn();
    const resolve = vi.fn((value: string) => value);
    const spawn = vi.fn();

    vi.doMock("fs", () => ({
      default: { appendFile, createWriteStream },
      appendFile,
      createWriteStream,
    }));
    vi.doMock("path", () => ({
      default: { resolve },
      resolve,
    }));
    vi.doMock("child_process", () => ({
      spawn,
    }));

    const { runCommand } = await import("./runCommand.js");

    await expect(runCommand("printf hello", "/tmp/log.txt")).rejects.toThrow(
      "append failed",
    );
    expect(spawn).not.toHaveBeenCalled();
  });

  it("falls back to -1 when pid and close code are missing", async () => {
    vi.resetModules();

    const appendFile = vi.fn((_path, _data, cb) => cb(null));
    const createWriteStream = vi.fn(() => new PassThrough());
    const resolve = vi.fn((value: string) => value);
    const stdout = new PassThrough();
    const stderr = new PassThrough();
    const child = {
      pid: undefined,
      stdout,
      stderr,
      once: vi.fn((event: string, cb: (code: number | null) => void) => {
        if (event === "close") {
          cb(null);
        }
      }),
    };
    const spawn = vi.fn(() => child);

    vi.doMock("fs", () => ({
      default: { appendFile, createWriteStream },
      appendFile,
      createWriteStream,
    }));
    vi.doMock("path", () => ({
      default: { resolve },
      resolve,
    }));
    vi.doMock("child_process", () => ({
      spawn,
    }));

    const { runCommand } = await import("./runCommand.js");
    const result = await runCommand("printf hello", "/tmp/log.txt");

    expect(result).toEqual({ pid: -1, returncode: -1 });
    expect(spawn).toHaveBeenCalledWith("printf", ["hello"], {
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
  });
});
