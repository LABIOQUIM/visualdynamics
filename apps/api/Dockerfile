FROM node:lts-trixie-slim AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
      procps \
      openssl \
      curl \
      tar \
      gcc \
      g++ \
      make \
      grace \
      zip \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# Install dependencies based on the preferred package manager
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/api/package.json apps/api/prisma.config.ts ./apps/api/
COPY apps/api/prisma/schema.prisma ./apps/api/prisma/
RUN pnpm install --frozen-lockfile
RUN pnpm --filter api exec prisma generate

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/api ./apps/api

RUN pnpm --filter api build

FROM base AS runner
WORKDIR /app

ENV PATH="${PATH}:/gromacs/bin"

COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/static ./apps/api/static
COPY apps/api/package.json ./apps/api/

EXPOSE 3000

CMD ["pnpm", "--filter", "api", "start:prod"]