# syntax=docker/dockerfile:1.7
#
# Multi-stage build:
#   1. deps      — full deps (dev + prod) for the Astro build
#   2. build     — produces /app/dist (SSR + static assets)
#   3. prod-deps — production-only node_modules for the runtime image
#   4. runtime   — slim Alpine layer that actually ships

# ── 1. Full deps ──────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── 2. Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── 3. Production-only deps ───────────────────────────────────────────
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── 4. Runtime ────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# tini = sane PID 1 (signal handling, zombie reaping).
# curl = used by Docker healthcheck and useful for in-container debugging.
RUN apk add --no-cache tini curl \
 && addgroup -S app \
 && adduser -S -G app app \
 && mkdir -p /var/log/goodall \
 && chown -R app:app /var/log/goodall

COPY --from=build      /app/dist          ./dist
COPY --from=build      /app/package.json  ./package.json
COPY --from=prod-deps  /app/node_modules  ./node_modules

USER app
EXPOSE 3000

# Container-level healthcheck so orchestrators (compose, ECS, k8s) see liveness.
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=10s \
  CMD curl -fsS http://127.0.0.1:${PORT}/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "./dist/server/entry.mjs"]
