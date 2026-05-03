import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { admin, twoFactor, username } from "better-auth/plugins";

import { PrismaClient } from "../generated/prisma/client.js";

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
  trustedOrigins: [process.env.APP_URL ?? "http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // ── Maintenance mode: block non-admin sign-ins ────────────────────────
      if (ctx.path === "/sign-in/email" || ctx.path === "/sign-in/username") {
        const maintenanceFlag = await prisma.featureFlag.findUnique({
          where: { key: "maintenance-mode" },
        });

        const maintenanceOn =
          maintenanceFlag?.enabled === true &&
          (maintenanceFlag.variants as Record<string, unknown>)?.[
            maintenanceFlag.defaultVariant
          ] === true;

        if (maintenanceOn) {
          // Look up the user attempting to sign in to check their role.
          const identifier =
            ctx.path === "/sign-in/email"
              ? await prisma.user.findUnique({
                  where: {
                    email: (ctx.body as { email?: string })?.email ?? "",
                  },
                  select: { role: true },
                })
              : await prisma.user.findUnique({
                  where: {
                    username:
                      (ctx.body as { username?: string })?.username ?? "",
                  },
                  select: { role: true },
                });

          const role = identifier?.role;
          if (role!== "admin") {
            throw new APIError("FORBIDDEN", {
              message:
                "The system is currently under maintenance. Only administrators can sign in.",
            });
          }
        }
      }

      // ── Sign-ups: block when flag disabled ────────────────────────────────
      if (ctx.path !== "/sign-up/email") {
        return;
      }

      const signupsFlag = await prisma.featureFlag.findUnique({
        where: { key: "signups-enabled" },
      });

      const signsEnabled =
        signupsFlag?.enabled === true &&
        (signupsFlag.variants as Record<string, unknown>)?.[
          signupsFlag.defaultVariant
        ] === true;

      if (!signsEnabled) {
        throw new APIError("FORBIDDEN", {
          message: "Sign ups are currently disabled.",
        });
      }
    }),
  },
  plugins: [admin(), twoFactor(), username()],
});
