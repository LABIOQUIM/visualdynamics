FROM node:lts-trixie-slim AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

FROM node:lts-trixie-slim AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/web ./apps/web
COPY apps/api/package.json ./apps/api/

RUN pnpm --filter web build

FROM caddy:alpine AS runner
WORKDIR /usr/share/caddy

COPY --from=builder /app/apps/web/dist/client ./
COPY apps/web/Caddyfile /etc/caddy/Caddyfile
COPY apps/web/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
    && addgroup -S appgroup \
    && adduser -S -u 1001 -G appgroup appuser \
    && chown -R appuser:appgroup /usr/share/caddy /data /config

USER appuser

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
