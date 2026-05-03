import { describe, expect, it, vi } from "vitest";

import { withEnv } from "./test-utils/env.js";

const prismaPg = vi.fn();
const prismaClient = vi.fn();

vi.mock("@prisma/adapter-pg", () => ({
  PrismaPg: class {
    constructor(options: unknown) {
      prismaPg(options);
    }
  },
}));

vi.mock("./generated/prisma/client.js", () => ({
  PrismaClient: class {
    constructor(options: unknown) {
      prismaClient(options);
    }
  },
}));

describe("PrismaService", () => {
  it("builds the prisma adapter from database env vars", async () => {
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
        prismaPg.mockClear();
        prismaClient.mockClear();

        const { PrismaService } = await import("./prisma.service.js");

        new PrismaService();

        expect(prismaPg).toHaveBeenCalledWith({
          connectionString: "postgresql://dbuser:dbpass@dbhost:5432/dbname",
        });
        expect(prismaClient).toHaveBeenCalledWith({
          adapter: expect.anything(),
        });
      },
    );
  });
});
