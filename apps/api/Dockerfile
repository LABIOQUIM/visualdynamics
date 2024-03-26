FROM node:20-buster-slim AS base

# RUN apk add --no-cache procps
RUN apt update && apt install procps openssl -y \
  && apt-get clean
RUN corepack enable && corepack prepare yarn@3.6.4 --activate

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json .yarnrc.yml yarn.lock ./
COPY apps/api/package.json apps/api/.yarnrc.yml ./apps/api/
COPY packages ./packages
RUN yarn install
RUN yarn workspace database generate
RUN yarn workspace database build
RUN yarn install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json .yarnrc.yml yarn.lock .env ./
COPY apps/api ./apps/api
COPY --from=deps /app/packages ./packages

RUN yarn workspace api build

FROM base AS runner
COPY apps/api/bin/Mold2 /bin/Mold2
RUN chmod +x /bin/Mold2

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json .yarnrc.yml yarn.lock .env ./
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/.env ./apps/api.env
COPY apps/api/package.json ./apps/api
COPY --from=builder /app/packages ./packages

EXPOSE 3000

CMD ["yarn", "workspace", "api", "start:prod"]