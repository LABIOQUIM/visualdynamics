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
COPY apps/api/scripts ./apps/api/scripts/
RUN pnpm install --frozen-lockfile
RUN DB_USER=x DB_PASS=x DB_HOST=x DB_PORT=5432 DB_DATABASE=x \
    pnpm --filter api run generate

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/api ./apps/api
COPY --from=deps /app/apps/api/src/generated ./apps/api/src/generated

RUN pnpm --filter api build

FROM base AS runner
WORKDIR /app

ENV PATH="${PATH}:/gromacs/bin"

COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-workspace.yaml ./
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/static ./apps/api/static
COPY apps/api/package.json ./apps/api/

# Copy entrypoint script
COPY --chown=1001:1001 apps/api/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /app/apps/api

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser && \
    mkdir -p /files && \
    chown 1001:1001 /files && \
    chmod 0775 /files

ENTRYPOINT ["/entrypoint.sh"]

USER appuser

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
