import "dotenv/config";

import { defineConfig, env } from "prisma/config";

const user = env("DB_USER");
const pass = env("DB_PASS");
const host = env("DB_HOST");
const port = env("DB_PORT");
const name = env("DB_DATABASE");

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: `postgresql://${user}:${pass}@${host}:${port}/${name}`,
  },
});
