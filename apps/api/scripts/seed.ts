import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { auth } from "../src/lib/auth.js";
import {
  FEATURE_FLAG_TYPE,
  SIMULATION_STATUS,
  SIMULATION_TYPE,
  PrismaClient,
} from "../src/generated/prisma/client.js";

// ── Feature flags ───────────────────────────────────────────────────────────

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
    description:
      "Controls whether users can submit simulations to the queue.",
  },
  {
    key: "simulation-max-ligands",
    type: FEATURE_FLAG_TYPE.NUMBER,
    enabled: true,
    defaultVariant: "default",
    variants: {
      default: 20,
    },
    description:
      "Maximum number of ligand file pairs accepted per ACPYPE simulation.",
  },
] as const;

// ── Sample user configs ─────────────────────────────────────────────────────

const sampleUsers = [
  {
    email: "researcher1@example.com",
    password: "password123",
    name: "Researcher One",
    username: "researcher1",
    displayUsername: "researcher1",
    role: "user" as const,
  },
  {
    email: "biologist@example.com",
    password: "password123",
    name: "Biologist User",
    username: "biologist",
    displayUsername: "biologist",
    role: "user" as const,
  },
];

// ── Sample simulation configs ───────────────────────────────────────────────

type SampleSimulation = {
  moleculeName: string;
  type: SIMULATION_TYPE;
  status: SIMULATION_STATUS;
  ownerUsername: string;
  ligands?: { ligandITPName: string; ligandPDBName: string; position: number }[];
  daysAgo: number;
  errorCause?: string;
};

const sampleSimulations: SampleSimulation[] = [
  {
    moleculeName: "ubiquitin",
    type: SIMULATION_TYPE.acpype,
    status: SIMULATION_STATUS.COMPLETED,
    ownerUsername: "admin",
    daysAgo: 14,
    ligands: [
      { ligandITPName: "LigA", ligandPDBName: "LigA", position: 0 },
      { ligandITPName: "LigB", ligandPDBName: "LigB", position: 1 },
    ],
  },
  {
    moleculeName: "lysozyme",
    type: SIMULATION_TYPE.apo,
    status: SIMULATION_STATUS.COMPLETED,
    ownerUsername: "admin",
    daysAgo: 7,
  },
  {
    moleculeName: "hemoglobin",
    type: SIMULATION_TYPE.acpype,
    status: SIMULATION_STATUS.RUNNING,
    ownerUsername: "admin",
    daysAgo: 1,
    ligands: [
      { ligandITPName: "HEM", ligandPDBName: "HEM", position: 0 },
    ],
  },
  {
    moleculeName: "actin",
    type: SIMULATION_TYPE.apo,
    status: SIMULATION_STATUS.QUEUED,
    ownerUsername: "admin",
    daysAgo: 0,
  },
  {
    moleculeName: "maltose-binding-protein",
    type: SIMULATION_TYPE.acpype,
    status: SIMULATION_STATUS.COMPLETED,
    ownerUsername: "researcher1",
    daysAgo: 21,
    ligands: [
      {
        ligandITPName: "MBP_Lig",
        ligandPDBName: "MBP_Lig",
        position: 0,
      },
    ],
  },
  {
    moleculeName: "dna-polymerase",
    type: SIMULATION_TYPE.apo,
    status: SIMULATION_STATUS.ERRORED,
    ownerUsername: "researcher1",
    daysAgo: 3,
    errorCause:
      "Simulation failed due to force field parameter mismatch in residue 147.",
  },
  {
    moleculeName: "ribosome-subunit",
    type: SIMULATION_TYPE.apo,
    status: SIMULATION_STATUS.COMPLETED,
    ownerUsername: "biologist",
    daysAgo: 30,
  },
];

// ── Prisma client helpers ───────────────────────────────────────────────────

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

// ── Seed: Admin user ────────────────────────────────────────────────────────

type SeedAdminRole = "admin" | "user";

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
    select: { id: true, email: true, username: true },
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

// ── Seed: Feature flags ─────────────────────────────────────────────────────

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

// ── Seed: Sample users (non-admin) ──────────────────────────────────────────

async function seedSampleUsers(prisma: PrismaClient) {
  for (const userConfig of sampleUsers) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userConfig.email },
          { username: userConfig.username },
        ],
      },
      select: { id: true, email: true, username: true },
    });

    if (existing) {
      console.log(
        `Skipping sample user "${userConfig.email}" — already exists.`,
      );
      continue;
    }

    await auth.api.createUser({
      body: {
        email: userConfig.email,
        password: userConfig.password,
        name: userConfig.name,
        role: userConfig.role,
        data: {
          username: userConfig.username,
          displayUsername: userConfig.displayUsername,
        },
      },
    });

    console.log(`Seeded sample user "${userConfig.email}".`);
  }
}

// ── Seed: Sample simulations ────────────────────────────────────────────────

async function seedSampleSimulations(prisma: PrismaClient) {
  const users = await prisma.user.findMany({
    select: { id: true, username: true },
  });
  const userMap = new Map(users.map((u) => [u.username, u.id]));

  for (const sim of sampleSimulations) {
    const userId = userMap.get(sim.ownerUsername);

    if (!userId) {
      console.log(
        `Skipping simulation "${sim.moleculeName}" — user "${sim.ownerUsername}" not found.`,
      );
      continue;
    }

    const existing = await prisma.simulation.findFirst({
      where: { moleculeName: sim.moleculeName, userId },
      select: { id: true },
    });

    if (existing) {
      console.log(
        `Skipping simulation "${sim.moleculeName}" — already exists.`,
      );
      continue;
    }

    const now = new Date();
    const createdAt = new Date(
      now.getTime() - sim.daysAgo * 24 * 60 * 60 * 1000,
    );

    const hasStarted =
      sim.status === SIMULATION_STATUS.RUNNING ||
      sim.status === SIMULATION_STATUS.COMPLETED ||
      sim.status === SIMULATION_STATUS.ERRORED;

    const hasEnded =
      sim.status === SIMULATION_STATUS.COMPLETED ||
      sim.status === SIMULATION_STATUS.ERRORED;

    const startedAt = hasStarted
      ? new Date(createdAt.getTime() + 60 * 1000)
      : null;

    const endedAt = hasEnded
      ? new Date((startedAt ?? createdAt).getTime() + 5 * 60 * 1000)
      : null;

    await prisma.simulation.create({
      data: {
        moleculeName: sim.moleculeName,
        type: sim.type,
        status: sim.status,
        userId,
        createdAt,
        ...(startedAt ? { startedAt } : {}),
        ...(endedAt ? { endedAt } : {}),
        ...(sim.errorCause ? { errorCause: sim.errorCause } : {}),
        ...(sim.ligands ? { ligands: { create: sim.ligands } } : {}),
      },
    });

    console.log(
      `Seeded simulation "${sim.moleculeName}" for "${sim.ownerUsername}".`,
    );
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const prisma = getPrismaClient();

  try {
    await seedFeatureFlags(prisma);
    console.log(`Seeded ${featureFlags.length} feature flags.`);

    await seedAdminUser(prisma);
    await seedSampleUsers(prisma);
    await seedSampleSimulations(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

await main();
