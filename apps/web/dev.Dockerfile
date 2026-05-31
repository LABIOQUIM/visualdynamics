# Base image (unchanged)
FROM node:24-alpine AS base
LABEL authors="ivopr"

FROM base AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# Copy pnpm metadata + lockfile and workspace package.json files so resolution is consistent.
# Adjust the workspace paths if your monorepo has other locations (packages/* etc).
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile