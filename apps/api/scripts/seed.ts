import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { auth } from "../src/lib/auth.js";
import {
  FEATURE_FLAG_TYPE,
  PrismaClient,
} from "../src/generated/prisma/client.js";

type SeedAdminRole = "admin" | "user";

const featureFlags = [
  {
    key: "maintenance-mode",
    type: FEATURE_FLAG_TYPE.BOOLEAN,
    enabled: true,
    defaultVariant: "off",
    variants: {
      off: false,
      on: true,
    },
    description:
      "Restricts sign-ins to administrators while maintenance is active.",
  },
  {
    key: "signups-enabled",
    type: FEATURE_FLAG_TYPE.BOOLEAN,
    enabled: true,
    defaultVariant: "on",
    variants: {
      off: false,
      on: true,
    },
    description: "Controls whether new user registrations are allowed.",
  },
  {
    key: "simulation-submission",
    type: FEATURE_FLAG_TYPE.BOOLEAN,
    enabled: true,
    defaultVariant: "on",
    variants: {
      off: false,
      on: true,
    },
    description: "Controls whether users can submit simulations to the queue.",
  },
  {
    key: "simulation-max-ligands",
    type: FEATURE_FLAG_TYPE.NUMBER,
    enabled: true,
    defaultVariant: "default",
    variants: {
      default: 20,
    },
    description: "Maximum number of ligand file pairs accepted per ACPYPE simulation.",
  },
] as const;

function getConnectionString() {
  const user = process.env.DB_USER;
  const pass = process.env.DB_PASS;
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  const name = process.env.DB_DATABASE;

  return `postgresql://${user}:${pass}@${host}:${port}/${name}`;
}

function getPrismaClient() {
  const adapter = new PrismaPg({ connectionString: getConnectionString() });

  return new PrismaClient({ adapter });
}

function normalizeAdminRole(role: string | undefined): SeedAdminRole {
  return role?.trim() === "user" ? "user" : "admin";
}

function readAdminConfig() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    return null;
  }

  return {
    email,
    password,
    name: process.env.SEED_ADMIN_NAME?.trim() || "Administrator",
    username: process.env.SEED_ADMIN_USERNAME?.trim() || "admin",
    displayUsername:
      process.env.SEED_ADMIN_DISPLAY_USERNAME?.trim() || "admin",
    role: normalizeAdminRole(process.env.SEED_ADMIN_ROLE),
  };
}

async function seedFeatureFlags(prisma: PrismaClient) {
  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      create: flag,
      update: {
        type: flag.type,
        enabled: flag.enabled,
        defaultVariant: flag.defaultVariant,
        variants: flag.variants,
        description: flag.description,
      },
    });
  }
}

async function seedAdminUser(prisma: PrismaClient) {
  const admin = readAdminConfig();

  if (!admin) {
    console.log(
      "Skipping admin user seed. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to enable it.",
    );
    return;
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: admin.email.toLowerCase() }, { username: admin.username }],
    },
    select: {
      id: true,
      email: true,
      username: true,
    },
  });

  if (existingUser) {
    console.log(
      `Skipping admin user seed. User already exists for email "${existingUser.email}" or username "${existingUser.username}".`,
    );
    return;
  }

  await auth.api.createUser({
    body: {
      email: admin.email,
      password: admin.password,
      name: admin.name,
      role: admin.role,
      data: {
        username: admin.username,
        displayUsername: admin.displayUsername,
      },
    },
  });

  console.log(`Seeded admin user "${admin.email}".`);
}

async function main() {
  const prisma = getPrismaClient();

  try {
    await seedFeatureFlags(prisma);
    console.log(`Seeded ${featureFlags.length} feature flags.`);

    await seedAdminUser(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

await main();
