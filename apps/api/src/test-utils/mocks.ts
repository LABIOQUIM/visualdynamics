import { vi } from "vitest";

export function createQueueStub(
  overrides: Partial<{
    getJobs: ReturnType<typeof vi.fn>;
    getActiveCount: ReturnType<typeof vi.fn>;
    getFailedCount: ReturnType<typeof vi.fn>;
    getDelayedCount: ReturnType<typeof vi.fn>;
    getWaitingCount: ReturnType<typeof vi.fn>;
    getCompletedCount: ReturnType<typeof vi.fn>;
  }> = {},
) {
  return {
    getJobs: vi.fn().mockResolvedValue([]),
    getActiveCount: vi.fn().mockResolvedValue(0),
    getFailedCount: vi.fn().mockResolvedValue(0),
    getDelayedCount: vi.fn().mockResolvedValue(0),
    getWaitingCount: vi.fn().mockResolvedValue(0),
    getCompletedCount: vi.fn().mockResolvedValue(0),
    ...overrides,
  };
}

export function createPrismaStub() {
  return {
    simulation: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
    featureFlag: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  };
}
