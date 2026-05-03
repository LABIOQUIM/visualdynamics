import { describe, expect, it, vi } from "vitest";

const setProviderAndWait = vi.fn();

vi.mock("@openfeature/server-sdk", () => ({
  OpenFeature: {
    setProviderAndWait,
  },
}));

describe("FeatureFlagModule", () => {
  it("registers the prisma-backed OpenFeature provider on init", async () => {
    vi.resetModules();
    setProviderAndWait.mockReset().mockResolvedValue(undefined);

    const { FeatureFlagModule } = await import("./feature-flag.module.js");
    const prisma = {
      featureFlag: {
        findUnique: vi.fn(),
      },
    };
    const module = new FeatureFlagModule(prisma as any);

    await expect(module.onModuleInit()).resolves.toBeUndefined();
    expect(setProviderAndWait).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { name: "prisma-feature-flag" },
      }),
    );
  });
});
