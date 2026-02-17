# VisualDynamics

VisualDynamics is a WEB tool developed to automate biological simulations performed in Gromacs using a graphical interface to make molecular dynamics simulation a more user-friendly task.

The repository is a monorepo containing the backend API and the frontend web client. It's organized with Yarn workspaces and aims to provide a full-stack developer experience using:

- `apps/api` — NestJS backend (GraphQL/REST, Prisma, BullMQ).
- `apps/web` — Preact + Vite frontend (Mantine, TanStack).

This README explains the project layout, how to set up your environment, run each app in development, and build for production.

---

## Requirements

Before you begin, make sure you have:

- Node.js (LTS recommended — e.g. 24.x)
- Yarn (v4.x) — the repository uses Yarn workspaces
- Git
- Docker & Docker Compose
- PostgreSQL and Redis (PostgreSQL must be run locally as we`ve found some problems running it in containers)
- GROMACS built and installed on host machine (usually located at `/usr/local/gromacs`).

Note: The repo uses workspace packages under `apps/*`. Install dependencies from the repo root.

---

## Quick start (development)

1. Clone the repository and install dependencies

   - From the project root:
   `yarn install`

2. Set up environment variables

   - Create and edit `apps/api/.env` (see [Environment configuration](#environment-configuration) below).

3. Start services

   - Start the services in development mode with Docker:
     `docker compose up -d --build`

Open the web client (Vite) at `http://localhost:3000` and the API (NestJS) at `http://localhost:3001` for REST endpoint.

---

## Environment configuration

The API expects environment variables to configure the database, Redis, and other secrets. Place them in `apps/api/.env` (do not commit secrets to git).

Example `.env`:

```
# PostgreSQL (Prisma)
DATABASE_URL="postgresql://db_user:db_pass@localhost:5432/visualdynamics?schema=public"

# Redis (BullMQ)
REDIS_URL="redis://localhost:6379"

# App-specific
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
```

Adjust values for your local setup or Docker Compose stack.

---

## Database and migrations

The backend uses Prisma for database access and migrations.

From the `apps/api` directory, common commands:

- Generate Prisma client
  `cd apps/api && npx prisma generate`

- Create a migration (development)
  `cd apps/api && npx prisma migrate dev --name init`

- Apply migrations (production)
  `cd apps/api && npx prisma migrate deploy`

- Open Prisma Studio (inspect DB)
  `cd apps/api && npx prisma studio`

---

## Going for production

The repository contains `compose.prod.yml` at the repo root to orchestrate services (Redis, api, web).

- Production compose:
  `docker compose -f compose.prod.yml up --build -d`

Tip: If you change migrations, re-build or run migration commands inside the `api` container as needed.

---

## Troubleshooting

- Node / Yarn issues:
  - Ensure the proper Node version is used (use a version manager if needed).
  - If you get workspace or plugin resolution errors, run `yarn install` from the repo root again.

- Prisma / DB:
- - Commonly, host running services are reachable through the IP `172.17.0.1` in Docker containers, so this will probably need to be your `DB_HOST`. 
  - Confirm the other `DB_` variables are correct and the DB is reachable.
  - Run `npx prisma generate` after pulling changes that modify the Prisma schema.

- Docker:
  - If ports are in use, stop the conflicting services or change the compose ports.
  - Use `docker compose down -v` to remove volumes and start fresh (data loss warning).

If you run into an issue not covered here, open an issue in the repository describing the steps to reproduce.

---

## Contributing

- Follow the repository's commit conventions and linting rules. The repo includes `commitlint` and ESLint configuration.
- Create feature branches from `main` (or your project's default).
- Run linters and formatters before committing:
  - `yarn workspace api run lint`
  - `yarn workspace web run build` (to ensure front-end compiles)
