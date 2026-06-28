FROM node:24-alpine AS base
ARG NODE_ENV=production
ARG HUSKY=0
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN corepack enable pnpm
RUN corepack use pnpm@latest-11

FROM base AS dev-deps-env
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS prod-deps-env
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod

FROM base AS build-env
ARG VITE_API_BASE_URL
WORKDIR /app
COPY --from=dev-deps-env /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

FROM base AS final
WORKDIR /app
COPY --from=prod-deps-env /app/node_modules ./node_modules
COPY --from=build-env /app/build ./build
COPY ./package.json ./pnpm-lock.yaml ./
CMD ["pnpm", "run", "start"]
