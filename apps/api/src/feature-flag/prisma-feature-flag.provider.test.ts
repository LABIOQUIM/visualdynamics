import { describe, expect, it, vi } from "vitest";

import { createPrismaStub } from "../test-utils/mocks.js";

import { PrismaFeatureFlagProvider } from "./prisma-feature-flag.provider.js";

describe("PrismaFeatureFlagProvider", () => {
  it("resolves boolean flags and falls back for missing, disabled, and invalid values", async () => {
    const prisma = createPrismaStub();
    const provider = new PrismaFeatureFlagProvider(prisma as any);

    prisma.featureFlag.findUnique.mockResolvedValueOnce(null);
    await expect(
      provider.resolveBooleanEvaluation("missing", false, {} as any, {} as any),
    ).resolves.toEqual({ value: false, reason: "DEFAULT" });

    prisma.featureFlag.findUnique.mockResolvedValueOnce({
      key: "flag",
      type: "BOOLEAN",
      enabled: false,
      defaultVariant: "on",
      variants: { on: true },
    });
    await expect(
      provider.resolveBooleanEvaluation(
        "disabled",
        false,
        {} as any,
        {} as any,
      ),
    ).resolves.toEqual({ value: false, reason: "DISABLED" });

    prisma.featureFlag.findUnique.mockResolvedValueOnce({
      key: "flag",
      type: "BOOLEAN",
      enabled: true,
      defaultVariant: "on",
      variants: { on: "bad" },
    });
    await expect(
      provider.resolveBooleanEvaluation("invalid", false, {} as any, {} as any),
    ).resolves.toEqual({ value: false, reason: "ERROR" });

    prisma.featureFlag.findUnique.mockResolvedValueOnce({
      key: "flag",
      type: "BOOLEAN",
      enabled: true,
      defaultVariant: "on",
      variants: { on: true },
    });
    await expect(
      provider.resolveBooleanEvaluation("ok", false, {} as any, {} as any),
    ).resolves.toEqual({ value: true, variant: "on", reason: "STATIC" });
  });

  it("resolves string, number, and object flags", async () => {
    const prisma = createPrismaStub();
    const provider = new PrismaFeatureFlagProvider(prisma as any);

    prisma.featureFlag.findUnique.mockResolvedValueOnce({
      key: "str",
      type: "STRING",
      enabled: true,
      defaultVariant: "blue",
      variants: { blue: "navy" },
    });
    await expect(
      provider.resolveStringEvaluation("str", "x", {} as any, {} as any),
    ).resolves.toEqual({ value: "navy", variant: "blue", reason: "STATIC" });

    prisma.featureFlag.findUnique.mockResolvedValueOnce({
      key: "num",
      type: "NUMBER",
      enabled: true,
      defaultVariant: "big",
      variants: { big: 42 },
    });
    await expect(
      provider.resolveNumberEvaluation("num", 0, {} as any, {} as any),
    ).resolves.toEqual({ value: 42, variant: "big", reason: "STATIC" });

    prisma.featureFlag.findUnique.mockResolvedValueOnce({
      key: "obj",
      type: "OBJECT",
      enabled: true,
      defaultVariant: "full",
      variants: { full: { nested: true } },
    });
    await expect(
      provider.resolveObjectEvaluation(
        "obj",
        { nested: false },
        {} as any,
        {} as any,
      ),
    ).resolves.toEqual({
      value: { nested: true },
      variant: "full",
      reason: "STATIC",
    });
  });

  it("returns errors for invalid string and number variants", async () => {
    const prisma = createPrismaStub();
    const provider = new PrismaFeatureFlagProvider(prisma as any);

    prisma.featureFlag.findUnique.mockResolvedValueOnce({
      key: "str",
      type: "STRING",
      enabled: true,
      defaultVariant: "bad",
      variants: { bad: 1 },
    });
    await expect(
      provider.resolveStringEvaluation("str", "fallback", {} as any, {} as any),
    ).resolves.toEqual({ value: "fallback", reason: "ERROR" });

    prisma.featureFlag.findUnique.mockResolvedValueOnce({
      key: "num",
      type: "NUMBER",
      enabled: true,
      defaultVariant: "bad",
      variants: { bad: "oops" },
    });
    await expect(
      provider.resolveNumberEvaluation("num", 9, {} as any, {} as any),
    ).resolves.toEqual({ value: 9, reason: "ERROR" });
  });

  it("returns default or disabled reasons for string, number, and object flags", async () => {
    const prisma = createPrismaStub();
    const provider = new PrismaFeatureFlagProvider(prisma as any);

    prisma.featureFlag.findUnique.mockResolvedValueOnce(null);
    await expect(
      provider.resolveStringEvaluation(
        "missing-string",
        "fallback",
        {} as any,
        {} as any,
      ),
    ).resolves.toEqual({ value: "fallback", reason: "DEFAULT" });

    prisma.featureFlag.findUnique.mockResolvedValueOnce({
      key: "disabled-string",
      type: "STRING",
      enabled: false,
      defaultVariant: "value",
      variants: { value: "blue" },
    });
    await expect(
      provider.resolveStringEvaluation(
        "disabled-string",
        "fallback",
        {} as any,
        {} as any,
      ),
    ).resolves.toEqual({ value: "fallback", reason: "DISABLED" });

    prisma.featureFlag.findUnique.mockResolvedValueOnce(null);
    await expect(
      provider.resolveNumberEvaluation(
        "missing-number",
        7,
        {} as any,
        {} as any,
      ),
    ).resolves.toEqual({ value: 7, reason: "DEFAULT" });

    prisma.featureFlag.findUnique.mockResolvedValueOnce({
      key: "disabled-number",
      type: "NUMBER",
      enabled: false,
      defaultVariant: "value",
      variants: { value: 1 },
    });
    await expect(
      provider.resolveNumberEvaluation(
        "disabled-number",
        7,
        {} as any,
        {} as any,
      ),
    ).resolves.toEqual({ value: 7, reason: "DISABLED" });

    prisma.featureFlag.findUnique.mockResolvedValueOnce(null);
    await expect(
      provider.resolveObjectEvaluation(
        "missing-object",
        { enabled: false },
        {} as any,
        {} as any,
      ),
    ).resolves.toEqual({
      value: { enabled: false },
      reason: "DEFAULT",
    });

    prisma.featureFlag.findUnique.mockResolvedValueOnce({
      key: "disabled-object",
      type: "OBJECT",
      enabled: false,
      defaultVariant: "full",
      variants: { full: { enabled: true } },
    });
    await expect(
      provider.resolveObjectEvaluation(
        "disabled-object",
        { enabled: false },
        {} as any,
        {} as any,
      ),
    ).resolves.toEqual({
      value: { enabled: false },
      reason: "DISABLED",
    });
  });
});
