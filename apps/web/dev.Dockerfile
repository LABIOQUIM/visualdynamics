# Base image (unchanged)
FROM node:20-alpine AS base
LABEL authors="ivopr"

# --------------------
# deps stage: install dependencies as a non-root user matching host UID/GID
# --------------------
FROM base AS deps
ARG HOST_UID=1000
ARG HOST_GID=1000

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# Copy pnpm metadata + lockfile and workspace package.json files so resolution is consistent.
# Adjust the workspace paths if your monorepo has other locations (packages/* etc).
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/

# Create (or reuse) a user/group for the requested UID/GID and run pnpm as that user.
# The script reuses existing UID/GID if present in /etc/passwd or /etc/group to avoid "gid in use" errors.
RUN set -eux; \
  EXISTING_USER="$(awk -F: -v UID=${HOST_UID} '$3==UID {print $1; exit}' /etc/passwd || true)"; \
  if [ -n "$EXISTING_USER" ]; then \
    APP_USER="$EXISTING_USER"; \
    APP_GROUP="$(id -gn "$APP_USER")"; \
  else \
    EXISTING_GROUP="$(awk -F: -v GID=${HOST_GID} '$3==GID {print $1; exit}' /etc/group || true)"; \
    if [ -n "$EXISTING_GROUP" ]; then \
      APP_GROUP="$EXISTING_GROUP"; \
    else \
      addgroup -g ${HOST_GID} appgroup; APP_GROUP=appgroup; \
    fi; \
    adduser -D -u ${HOST_UID} -G "$APP_GROUP" -h /home/appuser -s /bin/sh appuser; APP_USER=appuser; \
  fi; \
  chown -R "${APP_USER}:${APP_GROUP}" /app; \
  echo "Using user ${APP_USER} (UID ${HOST_UID}) and group ${APP_GROUP} (GID ${HOST_GID})"; \
  # Run pnpm install as the correct user. Use --frozen-lockfile so lockfile mismatches fail early.
  su -s /bin/sh "$APP_USER" -c 'pnpm install --frozen-lockfile'

# --------------------
# runner stage: runtime
# --------------------
FROM node:20-alpine AS runner
ARG HOST_UID=1000
ARG HOST_GID=1000

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# Recreate or reuse group/user in runtime (so the numeric UID has a name when needed).
RUN set -eux; \
  EXISTING_USER="$(awk -F: -v UID=${HOST_UID} '$3==UID {print $1; exit}' /etc/passwd || true)"; \
  if [ -n "$EXISTING_USER" ]; then \
    APP_USER="$EXISTING_USER"; \
    APP_GROUP="$(id -gn "$APP_USER")"; \
  else \
    EXISTING_GROUP="$(awk -F: -v GID=${HOST_GID} '$3==GID {print $1; exit}' /etc/group || true)"; \
    if [ -n "$EXISTING_GROUP" ]; then \
      APP_GROUP="$EXISTING_GROUP"; \
    else \
      addgroup -g ${HOST_GID} appgroup; APP_GROUP=appgroup; \
    fi; \
    adduser -D -u ${HOST_UID} -G "$APP_GROUP" -h /home/appuser -s /bin/sh appuser; APP_USER=appuser; \
  fi; \
  echo "Runtime user will be ${APP_USER}:${APP_GROUP}"

# Copy installed node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# # Copy app source (if you prefer to copy only what you need, adjust accordingly)
# COPY . .

# # Ensure files are owned by the chosen UID/GID
# RUN chown -R ${HOST_UID}:${HOST_GID} /app || true

# # Run container as the numeric UID:GID (works even if no passwd entry exists)
# USER ${HOST_UID}:${HOST_GID}

# # Example start command — adjust to your app's real start command
# CMD ["node", "apps/web/dist/index.js"]
