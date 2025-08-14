FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /workspace

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
COPY app/package.json app/package.json
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Development image
FROM base AS dev
WORKDIR /workspace
COPY --from=deps /workspace/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm install -g pnpm

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["pnpm", "--filter", "app", "dev"] 