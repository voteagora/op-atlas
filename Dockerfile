FROM node:21-bullseye AS base

# Build arguments for environment flexibility
ARG NODE_ENV=development
ARG PORT=3000
ARG HOSTNAME=0.0.0.0

# Install dependencies only when needed
FROM base AS deps
RUN apt-get update && apt-get install -y \
    libc6 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /workspace

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
COPY app/package.json app/package.json
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Development image
FROM base AS dev
WORKDIR /workspace

# Create a non-root user for security
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 nextjs

# Set Node.js memory options for better performance
ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY --from=deps /workspace/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm install -g pnpm

# Set correct permissions
RUN chown -R nextjs:nodejs /workspace

# Switch to non-root user
USER nextjs

EXPOSE ${PORT}

ENV PORT=${PORT}
ENV HOSTNAME=${HOSTNAME}
ENV NODE_ENV=${NODE_ENV}

# Run from the root workspace to use pnpm filter
CMD ["pnpm", "--filter", "op-atlas", "dev"] 