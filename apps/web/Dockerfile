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

FROM node:lts-alpine AS runner
WORKDIR /app

RUN apk add --no-cache caddy

COPY --from=builder /app/apps/web/dist ./dist
COPY apps/web/Caddyfile /etc/caddy/Caddyfile
COPY apps/web/entrypoint.sh /entrypoint.sh
COPY apps/web/server ./server
RUN chmod +x /entrypoint.sh \
    && mkdir -p /data /config /app/dist/client \
    && addgroup -S appgroup \
    && adduser -S -u 1001 -G appgroup appuser \
    && chown -R appuser:appgroup /app /data /config /etc/caddy

USER appuser

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
