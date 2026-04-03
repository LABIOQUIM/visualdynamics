import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
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
  plugins: [
    admin() as UndefinedOnPartialDeep<ReturnType<typeof admin>>,
    twoFactor() as UndefinedOnPartialDeep<ReturnType<typeof twoFactor>>,
    username() as UndefinedOnPartialDeep<ReturnType<typeof username>>,
  ],
});
