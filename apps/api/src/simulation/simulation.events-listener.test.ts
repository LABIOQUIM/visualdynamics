import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  prismaPg,
  simulationUpdate,
  simulationUpdateMany,
  loggerInstances,
  queueEventsOn,
  queueEventsClose,
  queueEventsCtor,
} = vi.hoisted(() => ({
  prismaPg: vi.fn(),
  simulationUpdate: vi.fn(),
  simulationUpdateMany: vi.fn(),
  loggerInstances: [] as Array<{
    log: ReturnType<typeof vi.fn>;
    debug: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
  }>,
  queueEventsOn: vi.fn(),
  queueEventsClose: vi.fn(),
  queueEventsCtor: vi.fn(),
}));

vi.mock("@prisma/adapter-pg", () => ({
  PrismaPg: class {
    constructor(options: unknown) {
      prismaPg(options);
    }
  },
}));

vi.mock("../generated/prisma/client.js", () => ({
  PrismaClient: class {
    simulation = {
      update: simulationUpdate,
      updateMany: simulationUpdateMany,
    };
  },
}));

vi.mock("bullmq", () => ({
  Queue: class {},
  QueueEvents: class {
    constructor(name: string, options: unknown) {
      queueEventsCtor(name, options);
    }

    on = queueEventsOn;
    close = queueEventsClose;
  },
}));

vi.mock("@nestjs/common", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;

  return {
    ...actual,
    Logger: class {
      log = vi.fn();
      debug = vi.fn();
      error = vi.fn();
      warn = vi.fn();

      constructor() {
        loggerInstances.push(this);
      }
    },
  };
});

async function loadListener() {
  vi.resetModules();
  const mod = await import("./simulation.events-listener.js");
  return mod.SimulationEventsListener;
}

function createQueue(job: any = null) {
  return {
    name: "simulation",
    opts: {
      connection: { host: "redis", port: 6379 },
    },
    getJob: vi.fn().mockResolvedValue(job),
  };
}

describe("SimulationEventsListener", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loggerInstances.length = 0;
  });

  it("initializes queue events listeners and cleans them up", async () => {
    const SimulationEventsListener = await loadListener();
    const listener = new SimulationEventsListener(createQueue() as any);
    const onWaitingSpy = vi.spyOn(listener as any, "onWaiting");
    const onActiveSpy = vi.spyOn(listener as any, "onActive");
    const onCompletedSpy = vi.spyOn(listener as any, "onCompleted");
    const onFailedSpy = vi.spyOn(listener as any, "onFailed");

    listener.onModuleInit();
    const handlers = Object.fromEntries(queueEventsOn.mock.calls);
    await handlers.waiting({ jobId: "job-waiting" });
    await handlers.active({ jobId: "job-active" });
    await handlers.completed({ jobId: "job-completed" });
    await handlers.failed({ jobId: "job-failed", failedReason: "boom" });
    await listener.onModuleDestroy();

    expect(queueEventsCtor).toHaveBeenCalledWith("simulation", {
      connection: { host: "redis", port: 6379 },
    });
    expect(queueEventsOn).toHaveBeenCalledTimes(4);
    expect(queueEventsClose).toHaveBeenCalled();
    expect(onWaitingSpy).toHaveBeenCalledWith("job-waiting");
    expect(onActiveSpy).toHaveBeenCalledWith("job-active");
    expect(onCompletedSpy).toHaveBeenCalledWith("job-completed");
    expect(onFailedSpy).toHaveBeenCalledWith("job-failed", "boom");
  });

  it("marks active jobs as running and fails jobs on prisma update errors", async () => {
    const SimulationEventsListener = await loadListener();
    simulationUpdate
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("db fail"))
      .mockRejectedValueOnce("plain fail");
    const successJob = {
      id: "job-1",
      token: "token-1",
      data: { simulationId: "sim-1" },
      moveToFailed: vi.fn(),
    };
    const failingJob = {
      id: "job-2",
      token: "token-2",
      data: { simulationId: "sim-2" },
      moveToFailed: vi.fn(),
    };
    const plainFailJob = {
      id: "job-3",
      token: "token-3",
      data: { simulationId: "sim-3" },
      moveToFailed: vi.fn(),
    };
    const queue = createQueue(successJob);
    const listener = new SimulationEventsListener(queue as any);

    await (listener as any).onActive("job-1");
    expect(simulationUpdate).toHaveBeenCalledWith({
      where: { id: "sim-1" },
      data: { status: "RUNNING", startedAt: expect.any(Date) },
    });

    queue.getJob.mockResolvedValueOnce(failingJob);
    await (listener as any).onActive("job-2");
    expect(failingJob.moveToFailed).toHaveBeenCalledWith(
      expect.any(Error),
      "token-2",
    );
    expect(loggerInstances[0]?.error).toHaveBeenCalledWith(
      "Failed during pre-step setup for job job-2",
      expect.stringContaining("db fail"),
    );

    queue.getJob.mockResolvedValueOnce(plainFailJob);
    await (listener as any).onActive("job-3");
    expect(plainFailJob.moveToFailed).toHaveBeenCalledWith(
      expect.objectContaining({ message: "plain fail" }),
      "token-3",
    );
    expect(loggerInstances[0]?.error).toHaveBeenCalledWith(
      "Failed during pre-step setup for job job-3",
      "plain fail",
    );
  });

  it("ignores missing active and completed jobs and completes existing jobs", async () => {
    const SimulationEventsListener = await loadListener();
    simulationUpdate.mockResolvedValue(undefined);
    const queue = createQueue(null);
    const listener = new SimulationEventsListener(queue as any);

    await (listener as any).onActive("missing");
    await (listener as any).onCompleted("missing");

    queue.getJob.mockResolvedValueOnce({
      data: { simulationId: "sim-3" },
    });
    await (listener as any).onCompleted("job-3");

    expect(simulationUpdate).toHaveBeenCalledWith({
      where: { id: "sim-3" },
      data: { endedAt: expect.any(Date), status: "COMPLETED" },
    });
  });

  it("handles waiting jobs across race, reset, no-op, and error branches", async () => {
    const SimulationEventsListener = await loadListener();
    simulationUpdateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    const waitingJob = {
      data: { simulationId: "sim-4" },
      getState: vi.fn().mockResolvedValue("waiting"),
    };
    const delayedJob = {
      data: { simulationId: "sim-4b" },
      getState: vi.fn().mockResolvedValue("delayed"),
    };
    const activeJob = {
      data: { simulationId: "sim-5" },
      getState: vi.fn().mockResolvedValue("active"),
    };
    const queue = createQueue(waitingJob);
    const listener = new SimulationEventsListener(queue as any);

    await (listener as any).onWaiting("job-waiting");
    expect(simulationUpdateMany).toHaveBeenCalledWith({
      where: { id: "sim-4", status: "RUNNING" },
      data: {
        status: "QUEUED",
        startedAt: null,
        endedAt: null,
        errorCause: null,
      },
    });

    queue.getJob.mockResolvedValueOnce(delayedJob);
    await (listener as any).onWaiting("job-delayed");
    expect(simulationUpdateMany).toHaveBeenCalledWith({
      where: { id: "sim-4b", status: "RUNNING" },
      data: {
        status: "QUEUED",
        startedAt: null,
        endedAt: null,
        errorCause: null,
      },
    });

    queue.getJob.mockResolvedValueOnce(activeJob);
    await (listener as any).onWaiting("job-active");
    expect(loggerInstances[0]?.debug).toHaveBeenCalledWith(
      'Job job-active waiting event skipped — job is already in state "active".',
    );

    queue.getJob.mockResolvedValueOnce(waitingJob);
    await (listener as any).onWaiting("job-noop");
    expect(loggerInstances[0]?.debug).toHaveBeenCalledWith(
      "Job job-noop waiting event was a no-op (not in RUNNING state).",
    );

    queue.getJob.mockResolvedValueOnce(null);
    await (listener as any).onWaiting("job-missing");

    queue.getJob.mockRejectedValueOnce("queue fail");
    await (listener as any).onWaiting("job-error");
    expect(loggerInstances[0]?.error).toHaveBeenCalledWith(
      "Error handling waiting event for job job-error",
      "queue fail",
    );

    queue.getJob.mockRejectedValueOnce(new Error("queue fail error"));
    await (listener as any).onWaiting("job-error-stack");
    expect(loggerInstances[0]?.error).toHaveBeenCalledWith(
      "Error handling waiting event for job job-error-stack",
      expect.stringContaining("queue fail error"),
    );
  });

  it("marks failed jobs as errored unless already canceled", async () => {
    const SimulationEventsListener = await loadListener();
    simulationUpdateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    const queue = createQueue({
      data: { simulationId: "sim-6" },
    });
    const listener = new SimulationEventsListener(queue as any);

    await (listener as any).onFailed("job-fail", "boom");
    expect(simulationUpdateMany).toHaveBeenCalledWith({
      where: {
        id: "sim-6",
        status: { not: "CANCELED" },
      },
      data: {
        status: "ERRORED",
        endedAt: expect.any(Date),
        errorCause: "boom",
      },
    });

    await (listener as any).onFailed("job-fail-2", "boom");
    expect(loggerInstances[0]?.debug).toHaveBeenCalledWith(
      "Job job-fail-2 failed event skipped — simulation is already CANCELED.",
    );

    queue.getJob.mockResolvedValueOnce(null);
    await (listener as any).onFailed("missing", "boom");
  });
});
