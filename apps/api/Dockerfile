FROM node:lts-slim AS base

# RUN apk add --no-cache procps
RUN apt update && apt install procps openssl curl tar gcc g++ make grace zip -y \
  && apt-get clean

RUN curl -OL https://github.com/Kitware/CMake/releases/download/v4.0.1/cmake-4.0.1-linux-x86_64.sh
RUN chmod +x cmake-4.0.1-linux-x86_64.sh
RUN ./cmake-4.0.1-linux-x86_64.sh --skip-license --prefix=/usr/

WORKDIR /gromacsbuild

RUN curl -O https://ftp.gromacs.org/gromacs/gromacs-2025.1.tar.gz
RUN tar xfz gromacs-2025.1.tar.gz
RUN cd gromacs-2025.1 && mkdir build
WORKDIR /gromacsbuild/gromacs-2025.1/build
RUN cmake .. -DGMX_BUILD_OWN_FFTW=ON -DREGRESSIONTEST_DOWNLOAD=on
RUN make -j4
RUN make install
ENV PATH="${PATH}:/usr/local/gromacs/bin"

FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json .yarnrc.yml yarn.lock ./
COPY .yarn/releases/yarn-4.0.1.cjs ./.yarn/releases/
COPY apps/api/package.json apps/api/.yarnrc.yml ./apps/api/
COPY packages ./packages
RUN yarn install
RUN yarn workspace database generate
RUN yarn workspace database build
RUN yarn install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY .yarn/releases/yarn-4.0.1.cjs ./.yarn/releases/
COPY --from=deps /app/node_modules ./node_modules
COPY package.json .yarnrc.yml yarn.lock .env ./
COPY apps/api ./apps/api
COPY --from=deps /app/packages ./packages

RUN yarn workspace api build

FROM base AS runner
# COPY apps/api/bin/Mold2 /bin/Mold2
# RUN chmod +x /bin/Mold2

WORKDIR /app

COPY .yarn/releases/yarn-4.0.1.cjs ./.yarn/releases/
COPY --from=deps /app/node_modules ./node_modules
COPY package.json .yarnrc.yml yarn.lock .env ./
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/static ./apps/api/static
COPY --from=builder /app/apps/api/.env ./apps/api.env
COPY apps/api/package.json ./apps/api
COPY --from=builder /app/packages ./packages

EXPOSE 3000

CMD ["yarn", "workspace", "api", "start:prod"]