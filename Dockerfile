# syntax=docker/dockerfile:1
# ---------------------------------------------------------------------------
# Digital Menu - container image
#
# This file has two stages on purpose:
#   * `base`       - only the runtime, NO application source. The developer
#                    environment (docker-compose.base44.yml) builds this stage
#                    and bind-mounts the repo, so code edits are live.
#   * `production` - source and dependencies baked in, for real deployments.
# ---------------------------------------------------------------------------

FROM node:22-bookworm-slim AS base
# `sharp` and `better-sqlite3` ship prebuilt binaries for this image, so no
# compiler toolchain is needed.
ENV NODE_ENV=development
WORKDIR /app
EXPOSE 3000
# Directory holding the SQLite database and uploaded images.
RUN mkdir -p /app/data

# ---------------------------------------------------------------------------
# Production stage: used by `docker build -t digital-menu .`
# ---------------------------------------------------------------------------
FROM base AS production

ENV NODE_ENV=production

# Install exactly what the lockfile pins (reproducible builds).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

COPY . .
RUN mkdir -p /app/data && chown -R node:node /app

# Run as an unprivileged user.
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
