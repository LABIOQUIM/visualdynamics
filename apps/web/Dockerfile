FROM node:20-alpine AS base
LABEL authors="ivopr"

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json .yarnrc.yml yarn.lock ./
COPY .yarn/releases/yarn-4.0.1.cjs ./.yarn/releases/
COPY apps/web/package.json apps/web/.yarnrc.yml ./apps/web/
COPY packages ./packages
RUN yarn install
RUN yarn workspace database generate
RUN yarn workspace database build

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY .yarn/releases/yarn-4.0.1.cjs ./.yarn/releases/
COPY package.json .yarnrc.yml yarn.lock .env ./
COPY apps/web ./apps/web
COPY --from=deps /app/packages ./packages

RUN yarn workspace web build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

#COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/ui/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/ui/.next/static ./apps/ui/.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# CMD ["sleep", "infinity"]
CMD ["node", "apps/web/server.js"]
