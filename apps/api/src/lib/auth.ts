import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { admin, twoFactor, username } from "better-auth/plugins";
import type { UndefinedOnPartialDeep } from "type-fest";

import { PrismaClient } from "../generated/prisma/client";

const user = process.env.DB_USER;
const pass = process.env.DB_PASS;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const name = process.env.DB_DATABASE;

const connectionString = `postgresql://${user}:${pass}@${host}:${port}/${name}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  basePath: "/auth",
  trustedOrigins: ["http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") {
        return;
      }

      const flag = await prisma.featureFlag.findUnique({
        where: { key: "signups-enabled" },
      });

      // Most limiting default: if the flag doesn't exist, is disabled, or
      // its active variant is not explicitly `true`, block sign-ups.
      const signsEnabled =
        flag?.enabled === true &&
        (flag.variants as Record<string, unknown>)?.[flag.defaultVariant] ===
          true;

      if (!signsEnabled) {
        throw new APIError("FORBIDDEN", {
          message: "Sign ups are currently disabled.",
        });
      }
    }),
  },
  plugins: [
    admin() as UndefinedOnPartialDeep<ReturnType<typeof admin>>,
    twoFactor() as UndefinedOnPartialDeep<ReturnType<typeof twoFactor>>,
    username() as UndefinedOnPartialDeep<ReturnType<typeof username>>,
  ],
});
