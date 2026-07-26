import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { admin, twoFactor, username } from "better-auth/plugins";

import { PrismaClient } from "../generated/prisma/client.js";
import { sendEmail } from "./email.js";

const user = process.env.DB_USER;
const pass = process.env.DB_PASS;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const name = process.env.DB_DATABASE;

const connectionString = `postgresql://${user}:${pass}@${host}:${port}/${name}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/auth",
  trustedOrigins: [process.env.SITE_URL ?? "http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      if (process.env.NODE_ENV === "production") {
        const u = new URL(url);
        url = `${u.origin}/api${u.pathname}${u.search}`;
      }
      await sendEmail({
        to: user.email,
        subject: "Reset your password — Visual Dynamics",
        html: `<p>Hello ${user.name},</p>
<p>You requested a password reset. Click the link below to set a new password:</p>
<p><a href="${url}" style="display:inline-block;padding:12px 24px;background-color:#228be6;color:#fff;text-decoration:none;border-radius:4px">Reset password</a></p>
<p>Or copy and paste this URL into your browser:</p>
<p>${url}</p>
<p>This link will expire in 1 hour. If you did not request this, you can safely ignore this email.</p>`,
      });
    },
    revokeSessionsOnPasswordReset: true,
    onPasswordReset: async ({ user }) => {
      await prisma.user.update({
        where: { id: user.id },
        data: { requirePasswordChange: false },
      });
    },
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
          if (role !== "admin") {
            throw new APIError("FORBIDDEN", {
              message:
                "The system is currently under maintenance. Only administrators can sign in.",
            });
          }
        }

        // ── Force password change: block sign-in when flag is set ──────────
        const signInUser =
          ctx.path === "/sign-in/email"
            ? await prisma.user.findUnique({
                where: {
                  email: (ctx.body as { email?: string })?.email ?? "",
                },
                select: { requirePasswordChange: true },
              })
            : await prisma.user.findUnique({
                where: {
                  username:
                    (ctx.body as { username?: string })?.username ?? "",
                },
                select: { requirePasswordChange: true },
              });

        if (signInUser?.requirePasswordChange) {
          throw new APIError("UNAUTHORIZED", {
            message:
              "Your password must be reset before you can sign in. Please use the forgot password option below.",
          });
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
