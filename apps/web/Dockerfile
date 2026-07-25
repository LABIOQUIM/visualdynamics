FROM node:lts-trixie-slim AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

FROM node:lts-trixie-slim AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web ./apps/web
COPY apps/api/package.json ./apps/api/

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN pnpm --filter web build

FROM node:lts-alpine AS runner
WORKDIR /app

RUN apk add --no-cache caddy

COPY --from=builder /app/apps/web/dist ./dist
COPY apps/web/Caddyfile /etc/caddy/Caddyfile
COPY apps/web/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
    && mkdir -p /data /config /app/dist \
    && addgroup -S appgroup \
    && adduser -S -u 1001 -G appgroup appuser \
    && chown -R appuser:appgroup /app /data /config /etc/caddy

USER appuser

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
