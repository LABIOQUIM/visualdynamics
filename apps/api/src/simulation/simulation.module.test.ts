import { MODULE_METADATA } from "@nestjs/common/constants";
import { describe, expect, it, vi } from "vitest";

const registerQueue = vi.fn(() => "queue-registration");
const forFeature = vi.fn(() => "board-feature");
class MockSimulationConsumer {}
class MockSimulationController {}
class MockSimulationEventsListener {}
class MockSimulationService {}
class MockSimulationCreationService {}
class MockSimulationFileService {}
class MockSimulationCleanupService {}
class MockPrismaService {}

vi.mock("@nestjs/bullmq", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    BullModule: {
      registerQueue,
    },
  };
});

vi.mock("@bull-board/nestjs", () => ({
  BullBoardModule: {
    forFeature,
  },
}));

vi.mock("@bull-board/api/bullMQAdapter", () => ({
  BullMQAdapter: class BullMQAdapter {},
}));

vi.mock("./simulation.consumer.js", () => ({
  SimulationConsumer: MockSimulationConsumer,
}));

vi.mock("./simulation.controller.js", () => ({
  SimulationController: MockSimulationController,
}));

vi.mock("./simulation.events-listener.js", () => ({
  SimulationEventsListener: MockSimulationEventsListener,
}));

vi.mock("./simulation.service.js", () => ({
  SimulationService: MockSimulationService,
}));

vi.mock("./simulation.creation.service.js", () => ({
  SimulationCreationService: MockSimulationCreationService,
}));

vi.mock("./simulation.file.service.js", () => ({
  SimulationFileService: MockSimulationFileService,
}));

vi.mock("./simulation.cleanup.service.js", () => ({
  SimulationCleanupService: MockSimulationCleanupService,
}));

vi.mock("../prisma.service.js", () => ({
  PrismaService: MockPrismaService,
}));

describe("SimulationModule", () => {
  it("registers queue, board feature, controller, and providers", async () => {
    vi.resetModules();
    registerQueue.mockClear();
    forFeature.mockClear();

    const { SimulationModule } = await import("./simulation.module.js");

    expect(registerQueue).toHaveBeenCalledWith({
      name: "simulation",
    });
    expect(forFeature).toHaveBeenCalledWith({
      adapter: expect.any(Function),
      name: "simulation",
      options: {
        description: "The Simulation Queue runs all the simulations submitted.",
      },
    });

    expect(
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, SimulationModule),
    ).toEqual([MockSimulationController]);
    expect(
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, SimulationModule),
    ).toEqual([
      MockSimulationConsumer,
      MockSimulationEventsListener,
      MockSimulationService,
      MockSimulationCreationService,
      MockSimulationFileService,
      MockSimulationCleanupService,
      MockPrismaService,
    ]);
  });
});
