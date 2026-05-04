import { beforeEach, describe, expect, it, vi } from "vitest";

const realSetTimeout = globalThis.setTimeout;

const {
  prismaPg,
  disconnect,
  executeCommands,
  loadCommands,
  chdir,
  files,
  readOverrides,
  writeBehaviors,
  unlinkBehaviors,
} = vi.hoisted(() => ({
  prismaPg: vi.fn(),
  disconnect: vi.fn().mockResolvedValue(undefined),
  executeCommands: vi.fn().mockResolvedValue(undefined),
  loadCommands: vi.fn().mockResolvedValue(["echo test"]),
  chdir: vi.fn(),
  files: new Map<string, string>(),
  readOverrides: new Map<string, string | Error | (() => string | Error)>(),
  writeBehaviors: [] as Array<Error | undefined>,
  unlinkBehaviors: [] as Array<Error | undefined>,
}));

function err(code: string, message = code) {
  return Object.assign(new Error(message), { code });
}

vi.mock("@prisma/adapter-pg", () => ({
  PrismaPg: class {
    constructor(options: unknown) {
      prismaPg(options);
    }
  },
}));

vi.mock("../generated/prisma/client.js", () => ({
  PrismaClient: class {
    $disconnect = disconnect;
  },
}));

vi.mock("../utils/executeCommands.js", () => ({
  executeCommands,
}));

vi.mock("../utils/loadCommands.js", () => ({
  loadCommands,
}));

vi.mock("process", async (importOriginal) => {
  const actual = await importOriginal<typeof import("process")>();
  return {
    ...actual,
    chdir,
  };
});

vi.mock("fs", () => ({
  existsSync: vi.fn((filePath: string) => files.has(filePath)),
  readFileSync: vi.fn((filePath: string) => {
    const override = readOverrides.get(filePath);
    if (typeof override === "function") {
      const value = override();
      if (value instanceof Error) {
        throw value;
      }
      return value;
    }
    if (override instanceof Error) {
      throw override;
    }
    if (typeof override === "string") {
      return override;
    }
    const value = files.get(filePath);
    if (value === undefined) {
      throw err("ENOENT", `ENOENT ${filePath}`);
    }
    return value;
  }),
  unlinkSync: vi.fn((filePath: string) => {
    const behavior = unlinkBehaviors.shift();
    if (behavior) {
      throw behavior;
    }
    if (!files.has(filePath)) {
      throw err("ENOENT", `ENOENT ${filePath}`);
    }
    files.delete(filePath);
  }),
  writeFileSync: vi.fn(
    (
      filePath: string,
      content: string,
      options?: {
        flag?: string;
      },
    ) => {
      const behavior = writeBehaviors.shift();
      if (behavior) {
        throw behavior;
      }
      if (options?.flag === "wx" && files.has(filePath)) {
        throw err("EEXIST", `EEXIST ${filePath}`);
      }
      files.set(filePath, content);
    },
  ),
}));

async function loadProcessor() {
  vi.resetModules();
  return import("./simulation.processor.js");
}

function procStat(startTime: string, pgid = 3456) {
  const tail = Array.from({ length: 20 }, (_, index) =>
    index === 0
      ? "S"
      : index === 2
        ? String(pgid)
        : index === 19
          ? startTime
          : "0",
  );
  return `999 (node process) ${tail.join(" ")}`;
}

function invokeTimeoutImmediately(
  callback: Parameters<typeof setTimeout>[0],
  _delay?: Parameters<typeof setTimeout>[1],
  ...args: Parameters<typeof setTimeout> extends [unknown, unknown?, ...infer Rest]
    ? Rest
    : never
): ReturnType<typeof setTimeout> {
  callback(...args);
  return realSetTimeout(() => {}, 0);
}

describe("simulation.processor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    files.clear();
    readOverrides.clear();
    writeBehaviors.length = 0;
    unlinkBehaviors.length = 0;
    loadCommands.mockResolvedValue(["echo test"]);
    executeCommands.mockResolvedValue(undefined);
    disconnect.mockResolvedValue(undefined);
    chdir.mockReset();
    readOverrides.set(`/proc/${process.pid}/stat`, procStat("12345", 9999));
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process, "kill").mockImplementation(() => true);
    vi.spyOn(Date, "now").mockImplementation(() => 0);
    vi.spyOn(globalThis, "setTimeout").mockImplementation(invokeTimeoutImmediately);
  });

  it("reads process metadata helpers and process-running states", async () => {
    const { isProcessRunning, readProcessGroupId, readProcessStartTime } =
      await loadProcessor();

    readOverrides.set("/proc/10/stat", procStat("777", 4321));
    expect(readProcessStartTime(10)).toBe("777");
    expect(readProcessGroupId(10)).toBe(4321);

    readOverrides.set("/proc/11/stat", procStat("888", 0));
    expect(readProcessGroupId(11)).toBeNull();

    readOverrides.set("/proc/12/stat", err("ENOENT"));
    expect(readProcessStartTime(12)).toBeNull();
    expect(readProcessGroupId(12)).toBeNull();

    readOverrides.set("/proc/13/stat", "13 (node)");
    expect(readProcessStartTime(13)).toBeNull();

    expect(isProcessRunning(50)).toBe(true);
    vi.mocked(process.kill).mockImplementationOnce(() => {
      throw Object.assign(new Error("denied"), { code: "EPERM" });
    });
    expect(isProcessRunning(51)).toBe(true);
    vi.mocked(process.kill).mockImplementationOnce(() => {
      throw Object.assign(new Error("gone"), { code: "ESRCH" });
    });
    expect(isProcessRunning(52)).toBe(false);
  });

  it("terminates process groups, falls back to pid signals, and escalates when needed", async () => {
    const { terminateProcess } = await loadProcessor();

    readOverrides.set("/proc/200/stat", procStat("2000", 3000));
    vi.mocked(process.kill)
      .mockImplementationOnce(() => true)
      .mockImplementationOnce(() => {
        throw Object.assign(new Error("gone"), { code: "ESRCH" });
      })
      .mockImplementationOnce(() => {
        throw Object.assign(new Error("gone"), { code: "ESRCH" });
      })
      .mockImplementationOnce(() => {
        throw Object.assign(new Error("gone"), { code: "ESRCH" });
      });
    await expect(terminateProcess(200)).resolves.toBe(true);
    expect(process.kill).toHaveBeenCalledWith(-3000, "SIGTERM");

    vi.clearAllMocks();
    vi.spyOn(process, "kill").mockImplementation(() => true);
    vi.spyOn(Date, "now").mockImplementation(() => 0);
    vi.spyOn(globalThis, "setTimeout").mockImplementation(invokeTimeoutImmediately);
    readOverrides.set(`/proc/${process.pid}/stat`, procStat("12345", 9999));
    readOverrides.set("/proc/201/stat", procStat("2001", 3001));
    vi.mocked(process.kill)
      .mockImplementationOnce(() => {
        throw err("EPERM");
      })
      .mockImplementationOnce(() => true)
      .mockImplementationOnce(() => true)
      .mockImplementationOnce(() => {
        throw Object.assign(new Error("gone"), { code: "ESRCH" });
      })
      .mockImplementationOnce(() => {
        throw Object.assign(new Error("gone"), { code: "ESRCH" });
      })
      .mockImplementationOnce(() => {
        throw Object.assign(new Error("gone"), { code: "ESRCH" });
      });
    await expect(terminateProcess(201)).resolves.toBe(true);
    expect(process.kill).toHaveBeenNthCalledWith(1, -3001, "SIGTERM");
    expect(process.kill).toHaveBeenNthCalledWith(2, 201, "SIGTERM");

    vi.clearAllMocks();
    vi.spyOn(process, "kill").mockImplementation(() => true);
    const nowValues = [0, 0, 6000];
    vi.spyOn(Date, "now").mockImplementation(() => nowValues.shift() ?? 6000);
    vi.spyOn(globalThis, "setTimeout").mockImplementation(invokeTimeoutImmediately);
    readOverrides.set(`/proc/${process.pid}/stat`, procStat("12345", 4000));
    readOverrides.set("/proc/202/stat", procStat("2002", 4000));
    vi.mocked(process.kill)
      .mockImplementationOnce(() => true)
      .mockImplementationOnce(() => true)
      .mockImplementationOnce(() => true)
      .mockImplementationOnce(() => true);
    await expect(terminateProcess(202)).resolves.toBe(false);
    expect(process.kill).toHaveBeenNthCalledWith(1, 202, "SIGTERM");
    expect(process.kill).toHaveBeenNthCalledWith(5, 202, "SIGKILL");
  });

  it("runs a job successfully and cleans its own lock file", async () => {
    const { default: processor } = await loadProcessor();
    const result = await processor({
      id: "job-1",
      data: {
        simulationId: "sim-1",
        user: { username: "alice" },
      },
    } as never);

    expect(result).toBe("sim-1 done!");
    expect(loadCommands).toHaveBeenCalledWith("/files/alice/sim-1");
    expect(chdir).toHaveBeenCalledWith("/files/alice/sim-1/run");
    expect(executeCommands).toHaveBeenCalledWith(
      ["echo test"],
      "/files/alice/sim-1/steps.txt",
      "/files/alice/sim-1/run/logs/gmx.log",
    );
    expect(files.get("/files/alice/sim-1/steps.txt")).toBe("");
    expect(files.has("/files/alice/sim-1/processing.pid")).toBe(false);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it("falls back to empty current-process start time when /proc is unreadable", async () => {
    const { default: processor } = await loadProcessor();
    readOverrides.set(`/proc/${process.pid}/stat`, err("ENOENT"));

    await expect(
      processor({
        id: "job-1b",
        data: {
          simulationId: "sim-1b",
          user: { username: "alice" },
        },
      } as never),
    ).resolves.toBe("sim-1b done!");
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Finished job job-1b"),
    );
  });

  it("retries when lock file disappears after EEXIST", async () => {
    const { default: processor } = await loadProcessor();
    files.set("/files/alice/sim-2/processing.pid", "stale");
    writeBehaviors.push(err("EEXIST"));

    await expect(
      processor({
        id: "job-2",
        data: {
          simulationId: "sim-2",
          user: { username: "alice" },
        },
      } as never),
    ).resolves.toBe("sim-2 done!");

    expect(files.has("/files/alice/sim-2/processing.pid")).toBe(false);
  });

  it("removes invalid and stale lock owners before continuing", async () => {
    const { default: processor } = await loadProcessor();

    files.set("/files/alice/sim-3/processing.pid", "badpid");
    writeBehaviors.push(err("EEXIST"));
    await expect(
      processor({
        id: "job-3",
        data: {
          simulationId: "sim-3",
          user: { username: "alice" },
        },
      } as never),
    ).resolves.toBe("sim-3 done!");
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Lock file contained invalid PID "badpid"'),
    );

    files.set(
      "/files/alice/sim-4/processing.pid",
      `${process.pid}:different-start`,
    );
    writeBehaviors.push(err("EEXIST"));
    await expect(
      processor({
        id: "job-4",
        data: {
          simulationId: "sim-4",
          user: { username: "alice" },
        },
      } as never),
    ).resolves.toBe("sim-4 done!");
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("has our PID but mismatched content"),
    );

    files.set("/files/alice/sim-5/processing.pid", `${process.pid}:12345`);
    writeBehaviors.push(err("EEXIST"));
    await expect(
      processor({
        id: "job-5",
        data: {
          simulationId: "sim-5",
          user: { username: "alice" },
        },
      } as never),
    ).resolves.toBe("sim-5 done!");
  });

  it("handles foreign processes that are gone, unverifiable, reused, or terminable", async () => {
    const { default: processor } = await loadProcessor();

    files.set("/files/alice/sim-6/processing.pid", "777:111");
    readOverrides.set("/proc/777/stat", err("ENOENT"));
    vi.mocked(process.kill).mockImplementationOnce(() => {
      throw Object.assign(new Error("gone"), { code: "ESRCH" });
    });
    writeBehaviors.push(err("EEXIST"));
    await expect(
      processor({
        id: "job-6",
        data: {
          simulationId: "sim-6",
          user: { username: "alice" },
        },
      } as never),
    ).resolves.toBe("sim-6 done!");

    files.set("/files/alice/sim-7/processing.pid", "778:");
    readOverrides.set("/proc/778/stat", procStat("live-start", 7000));
    writeBehaviors.push(err("EEXIST"));
    await expect(
      processor({
        id: "job-7",
        data: {
          simulationId: "sim-7",
          user: { username: "alice" },
        },
      } as never),
    ).rejects.toThrow(
      "Lock file for simulation sim-7 contains no start time for PID 778",
    );

    files.set("/files/alice/sim-8/processing.pid", "779:stale-start");
    readOverrides.set("/proc/779/stat", procStat("fresh-start", 7001));
    writeBehaviors.push(err("EEXIST"));
    await expect(
      processor({
        id: "job-8",
        data: {
          simulationId: "sim-8",
          user: { username: "alice" },
        },
      } as never),
    ).resolves.toBe("sim-8 done!");
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(
        "PID 779 in lock file appears to have been reused",
      ),
    );

    files.set("/files/alice/sim-9/processing.pid", "780:match");
    readOverrides.set("/proc/780/stat", procStat("match", 7002));
    vi.mocked(process.kill)
      .mockImplementationOnce(() => true)
      .mockImplementationOnce(() => {
        throw Object.assign(new Error("gone"), { code: "ESRCH" });
      })
      .mockImplementationOnce(() => {
        throw Object.assign(new Error("gone"), { code: "ESRCH" });
      })
      .mockImplementationOnce(() => {
        throw Object.assign(new Error("gone"), { code: "ESRCH" });
      });
    writeBehaviors.push(err("EEXIST"));
    await expect(
      processor({
        id: "job-9",
        data: {
          simulationId: "sim-9",
          user: { username: "alice" },
        },
      } as never),
    ).resolves.toBe("sim-9 done!");
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Terminated orphaned process 780"),
    );
  });

  it("fails closed on unverifiable running owners, exhausted retries, and unkillable orphans", async () => {
    const { default: processor } = await loadProcessor();

    files.set("/files/alice/sim-10/processing.pid", "781:123");
    readOverrides.set("/proc/781/stat", err("ENOENT"));
    vi.mocked(process.kill).mockImplementationOnce(() => {
      throw Object.assign(new Error("denied"), { code: "EPERM" });
    });
    writeBehaviors.push(err("EEXIST"));
    await expect(
      processor({
        id: "job-10",
        data: {
          simulationId: "sim-10",
          user: { username: "alice" },
        },
      } as never),
    ).rejects.toThrow("Unable to verify identity of existing process 781");

    files.set("/files/alice/sim-11/processing.pid", "782:match");
    readOverrides.set("/proc/782/stat", procStat("match", 8000));
    const nowValues = [0, 0, 6000];
    vi.mocked(Date.now).mockImplementation(() => nowValues.shift() ?? 6000);
    vi.mocked(process.kill)
      .mockImplementationOnce(() => true)
      .mockImplementationOnce(() => true)
      .mockImplementationOnce(() => true)
      .mockImplementationOnce(() => true)
      .mockImplementationOnce(() => true);
    writeBehaviors.push(err("EEXIST"));
    await expect(
      processor({
        id: "job-11",
        data: {
          simulationId: "sim-11",
          user: { username: "alice" },
        },
      } as never),
    ).rejects.toThrow("Could not terminate orphaned process 782");

    files.set("/files/alice/sim-12/processing.pid", "still-here");
    writeBehaviors.push(
      err("EEXIST"),
      err("EEXIST"),
      err("EEXIST"),
      err("EEXIST"),
      err("EEXIST"),
      err("EEXIST"),
      err("EEXIST"),
      err("EEXIST"),
      err("EEXIST"),
      err("EEXIST"),
      err("EEXIST"),
    );
    await expect(
      processor({
        id: "job-12",
        data: {
          simulationId: "sim-12",
          user: { username: "alice" },
        },
      } as never),
    ).rejects.toThrow("Failed to acquire simulation lock for sim-12");
  });

  it("handles non-EEXIST create errors, replaced stale locks, and empty-start dead owners", async () => {
    const { default: processor } = await loadProcessor();

    writeBehaviors.push(err("EPERM"));
    await expect(
      processor({
        id: "job-12a",
        data: {
          simulationId: "sim-12a",
          user: { username: "alice" },
        },
      } as never),
    ).rejects.toThrow("EPERM");

    files.set("/files/alice/sim-12b/processing.pid", "badpid");
    let sim12bReadCount = 0;
    readOverrides.set("/files/alice/sim-12b/processing.pid", () =>
      sim12bReadCount++ === 0 ? "badpid" : "new-owner",
    );
    writeBehaviors.push(
      err("EEXIST"),
      err("EEXIST"),
      err("EEXIST"),
      err("EEXIST"),
      err("EEXIST"),
      err("EEXIST"),
      err("EEXIST"),
      err("EEXIST"),
      err("EEXIST"),
      err("EEXIST"),
      err("EEXIST"),
    );
    await expect(
      processor({
        id: "job-12b",
        data: {
          simulationId: "sim-12b",
          user: { username: "alice" },
        },
      } as never),
    ).rejects.toThrow("Failed to acquire simulation lock for sim-12b");

    readOverrides.delete("/files/alice/sim-12b/processing.pid");
    files.set("/files/alice/sim-12c/processing.pid", "783:");
    readOverrides.set("/proc/783/stat", procStat("live-start", 8123));
    vi.mocked(process.kill).mockImplementationOnce(() => {
      throw Object.assign(new Error("gone"), { code: "ESRCH" });
    });
    writeBehaviors.push(err("EEXIST"));
    await expect(
      processor({
        id: "job-12c",
        data: {
          simulationId: "sim-12c",
          user: { username: "alice" },
        },
      } as never),
    ).resolves.toBe("sim-12c done!");
  });

  it("wraps error messages, preserves replacement locks, and swallows cleanup races", async () => {
    const { default: processor } = await loadProcessor();

    loadCommands.mockRejectedValueOnce(new Error("load failed"));
    await expect(
      processor({
        id: "job-13",
        data: {
          simulationId: "sim-13",
          user: { username: "alice" },
        },
      } as never),
    ).rejects.toThrow("load failed");

    executeCommands.mockImplementationOnce(async () => {
      files.set("/files/alice/sim-14/processing.pid", "other-owner");
      throw "plain failure";
    });
    await expect(
      processor({
        id: "job-14",
        data: {
          simulationId: "sim-14",
          user: { username: "alice" },
        },
      } as never),
    ).rejects.toThrow("Job sim-14 failed to run command!");
    expect(files.get("/files/alice/sim-14/processing.pid")).toBe("other-owner");

    loadCommands.mockRejectedValueOnce("plain load failure");
    await expect(
      processor({
        id: "job-15",
        data: {
          simulationId: "sim-15",
          user: { username: "alice" },
        },
      } as never),
    ).rejects.toThrow("Job sim-15 failed to run command!");

    unlinkBehaviors.push(err("ENOENT"));
    await expect(
      processor({
        id: "job-16",
        data: {
          simulationId: "sim-16",
          user: { username: "alice" },
        },
      } as never),
    ).resolves.toBe("sim-16 done!");

    files.set("/files/alice/sim-17/processing.pid", `${process.pid}:other`);
    unlinkBehaviors.push(err("EPERM"));
    writeBehaviors.push(err("EEXIST"));
    await expect(
      processor({
        id: "job-17",
        data: {
          simulationId: "sim-17",
          user: { username: "alice" },
        },
      } as never),
    ).rejects.toThrow("EPERM");
  });

  it("uses job id fallback when job data is malformed", async () => {
    const { default: processor } = await loadProcessor();

    loadCommands.mockRejectedValueOnce("plain load failure");
    await expect(
      processor({
        id: "job-18",
        data: {
          user: { username: "alice" },
        },
      } as never),
    ).rejects.toThrow("Job job-18 failed to run command!");
    expect(disconnect).toHaveBeenCalled();
  });
});
