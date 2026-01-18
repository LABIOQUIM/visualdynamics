FROM node:20-alpine AS base
LABEL authors="ivopr"

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json .yarnrc.yml yarn.lock ./
COPY .yarn/releases/yarn-4.11.0.cjs ./.yarn/releases/
COPY apps/web/package.json ./apps/web/
RUN yarn install

# Rebuild the source code only when needed
FROM base AS runner
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
