import { beforeEach, describe, expect, it, vi } from "vitest";

import { withEnv } from "../test-utils/env.js";

const prismaPg = vi.fn();
const prismaAdapter = vi.fn();
const betterAuth = vi.fn((config) => config);
const admin = vi.fn(() => "admin-plugin");
const twoFactor = vi.fn(() => "two-factor-plugin");
const username = vi.fn(() => "username-plugin");

class MockAPIError extends Error {
  code: string;

  constructor(code: string, options?: { message?: string }) {
    super(options?.message);
    this.code = code;
  }
}

const mockPrisma = {
  featureFlag: {
    findUnique: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
};

vi.mock("@prisma/adapter-pg", () => ({
  PrismaPg: class {
    constructor(options: unknown) {
      prismaPg(options);
    }
  },
}));

vi.mock("better-auth", () => ({
  betterAuth,
}));

vi.mock("better-auth/adapters/prisma", () => ({
  prismaAdapter,
}));

vi.mock("better-auth/api", () => ({
  APIError: MockAPIError,
  createAuthMiddleware: (handler: unknown) => handler,
}));

vi.mock("better-auth/plugins", () => ({
  admin,
  twoFactor,
  username,
}));

vi.mock("../generated/prisma/client.js", () => ({
  PrismaClient: class {
    featureFlag = mockPrisma.featureFlag;
    user = mockPrisma.user;
  },
}));

describe("auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.featureFlag.findUnique.mockReset();
    mockPrisma.user.findUnique.mockReset();
  });

  it("wires better-auth with the expected base config and plugins", async () => {
    await withEnv(
      {
        DB_USER: "dbuser",
        DB_PASS: "dbpass",
        DB_HOST: "dbhost",
        DB_PORT: "5432",
        DB_DATABASE: "dbname",
        APP_URL: "https://app.example.com",
      },
      async () => {
        vi.resetModules();
        prismaPg.mockClear();
        prismaAdapter.mockClear();
        betterAuth.mockClear();

        const { auth } = await import("./auth.js");

        expect(auth.basePath).toBe("/auth");
        expect(auth.trustedOrigins).toEqual(["https://app.example.com"]);
        expect(auth.emailAndPassword).toEqual({ enabled: true });
        expect(auth.plugins).toEqual([
          "admin-plugin",
          "two-factor-plugin",
          "username-plugin",
        ]);
        expect(prismaPg).toHaveBeenCalledWith({
          connectionString: "postgresql://dbuser:dbpass@dbhost:5432/dbname",
        });
        expect(prismaAdapter).toHaveBeenCalledWith(expect.anything(), {
          provider: "postgresql",
        });
        expect(betterAuth).toHaveBeenCalled();
      },
    );
  });

  it("blocks non-admin sign-ins during maintenance mode", async () => {
    await withEnv(
      {
        DB_USER: "dbuser",
        DB_PASS: "dbpass",
        DB_HOST: "dbhost",
        DB_PORT: "5432",
        DB_DATABASE: "dbname",
      },
      async () => {
        vi.resetModules();
        mockPrisma.featureFlag.findUnique.mockResolvedValue({
          enabled: true,
          defaultVariant: "on",
          variants: { on: true },
        });
        mockPrisma.user.findUnique.mockResolvedValue({ role: "user" });

        const { auth } = await import("./auth.js");

        await expect(
          auth.hooks.before({
            path: "/sign-in/email",
            body: { email: "user@example.com" },
          }),
        ).rejects.toThrow(
          "The system is currently under maintenance. Only administrators can sign in.",
        );
        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: "user@example.com" },
          select: { role: true },
        });
      },
    );
  });

  it("falls back to empty identifiers when maintenance mode sign-ins omit email or username", async () => {
    await withEnv(
      {
        DB_USER: "dbuser",
        DB_PASS: "dbpass",
        DB_HOST: "dbhost",
        DB_PORT: "5432",
        DB_DATABASE: "dbname",
      },
      async () => {
        vi.resetModules();
        mockPrisma.featureFlag.findUnique.mockResolvedValue({
          enabled: true,
          defaultVariant: "on",
          variants: { on: true },
        });
        mockPrisma.user.findUnique.mockResolvedValue({ role: "user" });

        const { auth } = await import("./auth.js");

        await expect(
          auth.hooks.before({
            path: "/sign-in/email",
            body: {},
          }),
        ).rejects.toThrow(
          "The system is currently under maintenance. Only administrators can sign in.",
        );

        await expect(
          auth.hooks.before({
            path: "/sign-in/username",
            body: {},
          }),
        ).rejects.toThrow(
          "The system is currently under maintenance. Only administrators can sign in.",
        );

        expect(mockPrisma.user.findUnique).toHaveBeenNthCalledWith(1, {
          where: { email: "" },
          select: { role: true },
        });
        expect(mockPrisma.user.findUnique).toHaveBeenNthCalledWith(2, {
          where: { username: "" },
          select: { role: true },
        });
      },
    );
  });

  it("blocks maintenance-mode sign-ins when the user lookup returns no account", async () => {
    await withEnv(
      {
        DB_USER: "dbuser",
        DB_PASS: "dbpass",
        DB_HOST: "dbhost",
        DB_PORT: "5432",
        DB_DATABASE: "dbname",
      },
      async () => {
        vi.resetModules();
        mockPrisma.featureFlag.findUnique.mockResolvedValue({
          enabled: true,
          defaultVariant: "on",
          variants: { on: true },
        });
        mockPrisma.user.findUnique.mockResolvedValue(undefined);

        const { auth } = await import("./auth.js");

        await expect(
          auth.hooks.before({
            path: "/sign-in/email",
            body: { email: "missing@example.com" },
          }),
        ).rejects.toThrow(
          "The system is currently under maintenance. Only administrators can sign in.",
        );
      },
    );
  });

  it("blocks maintenance-mode sign-ins when the looked-up account has no role", async () => {
    await withEnv(
      {
        DB_USER: "dbuser",
        DB_PASS: "dbpass",
        DB_HOST: "dbhost",
        DB_PORT: "5432",
        DB_DATABASE: "dbname",
      },
      async () => {
        vi.resetModules();
        mockPrisma.featureFlag.findUnique.mockResolvedValue({
          enabled: true,
          defaultVariant: "on",
          variants: { on: true },
        });
        mockPrisma.user.findUnique.mockResolvedValue({});

        const { auth } = await import("./auth.js");

        await expect(
          auth.hooks.before({
            path: "/sign-in/username",
            body: { username: "norole" },
          }),
        ).rejects.toThrow(
          "The system is currently under maintenance. Only administrators can sign in.",
        );
      },
    );
  });

  it("blocks sign-ups when the signups flag is disabled", async () => {
    await withEnv(
      {
        DB_USER: "dbuser",
        DB_PASS: "dbpass",
        DB_HOST: "dbhost",
        DB_PORT: "5432",
        DB_DATABASE: "dbname",
      },
      async () => {
        vi.resetModules();
        mockPrisma.featureFlag.findUnique.mockResolvedValueOnce({
          enabled: false,
          defaultVariant: "off",
          variants: { off: false },
        });

        const { auth } = await import("./auth.js");

        await expect(
          auth.hooks.before({
            path: "/sign-up/email",
            body: {},
          }),
        ).rejects.toThrow("Sign ups are currently disabled.");
      },
    );
  });

  it("allows admin sign-ins during maintenance mode", async () => {
    await withEnv(
      {
        DB_USER: "dbuser",
        DB_PASS: "dbpass",
        DB_HOST: "dbhost",
        DB_PORT: "5432",
        DB_DATABASE: "dbname",
      },
      async () => {
        vi.resetModules();
        mockPrisma.featureFlag.findUnique.mockResolvedValue({
          enabled: true,
          defaultVariant: "on",
          variants: { on: true },
        });
        mockPrisma.user.findUnique.mockResolvedValue({ role: "admin" });

        const { auth } = await import("./auth.js");

        await expect(
          auth.hooks.before({
            path: "/sign-in/username",
            body: { username: "admin-user" },
          }),
        ).resolves.toBeUndefined();
        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
          where: { username: "admin-user" },
          select: { role: true },
        });
      },
    );
  });

  it("allows admin email sign-ins during maintenance mode", async () => {
    await withEnv(
      {
        DB_USER: "dbuser",
        DB_PASS: "dbpass",
        DB_HOST: "dbhost",
        DB_PORT: "5432",
        DB_DATABASE: "dbname",
      },
      async () => {
        vi.resetModules();
        mockPrisma.featureFlag.findUnique.mockResolvedValue({
          enabled: true,
          defaultVariant: "on",
          variants: { on: true },
        });
        mockPrisma.user.findUnique.mockResolvedValue({ role: "admin" });

        const { auth } = await import("./auth.js");

        await expect(
          auth.hooks.before({
            path: "/sign-in/email",
            body: { email: "admin@example.com" },
          }),
        ).resolves.toBeUndefined();
        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: "admin@example.com" },
          select: { role: true },
        });
      },
    );
  });

  it("allows sign-ins when maintenance mode is off", async () => {
    await withEnv(
      {
        DB_USER: "dbuser",
        DB_PASS: "dbpass",
        DB_HOST: "dbhost",
        DB_PORT: "5432",
        DB_DATABASE: "dbname",
      },
      async () => {
        vi.resetModules();
        mockPrisma.featureFlag.findUnique.mockResolvedValue({
          enabled: true,
          defaultVariant: "off",
          variants: { off: false },
        });

        const { auth } = await import("./auth.js");

        await expect(
          auth.hooks.before({
            path: "/sign-in/email",
            body: { email: "user@example.com" },
          }),
        ).resolves.toBeUndefined();
        expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      },
    );
  });

  it("returns early for non-signup paths outside sign-in maintenance handling", async () => {
    await withEnv(
      {
        DB_USER: "dbuser",
        DB_PASS: "dbpass",
        DB_HOST: "dbhost",
        DB_PORT: "5432",
        DB_DATABASE: "dbname",
      },
      async () => {
        vi.resetModules();
        const { auth } = await import("./auth.js");

        await expect(
          auth.hooks.before({
            path: "/session",
            body: {},
          }),
        ).resolves.toBeUndefined();
        expect(mockPrisma.featureFlag.findUnique).not.toHaveBeenCalled();
      },
    );
  });

  it("allows sign-ups when the signups flag is enabled", async () => {
    await withEnv(
      {
        DB_USER: "dbuser",
        DB_PASS: "dbpass",
        DB_HOST: "dbhost",
        DB_PORT: "5432",
        DB_DATABASE: "dbname",
      },
      async () => {
        vi.resetModules();
        mockPrisma.featureFlag.findUnique.mockResolvedValue({
          enabled: true,
          defaultVariant: "on",
          variants: { on: true },
        });

        const { auth } = await import("./auth.js");

        await expect(
          auth.hooks.before({
            path: "/sign-up/email",
            body: {},
          }),
        ).resolves.toBeUndefined();
      },
    );
  });
});
