FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm@10.28.0

# Set working directory to repo root
WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all workspace packages
COPY packages ./packages
COPY apps/backend ./apps/backend

# Install dependencies from root
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
WORKDIR /app/packages/database
RUN npx prisma generate

# Build the backend
WORKDIR /app/apps/backend
RUN pnpm build

# Production stage
FROM node:18-alpine

RUN npm install -g pnpm@10.28.0

WORKDIR /app

# Copy built files and dependencies
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages ./packages
COPY --from=base /app/apps/backend/dist ./apps/backend/dist
COPY --from=base /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=base /app/apps/backend/package.json ./apps/backend/
COPY --from=base /app/package.json ./

WORKDIR /app/apps/backend

EXPOSE 3001

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
