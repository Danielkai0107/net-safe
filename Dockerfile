FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.28.0

WORKDIR /app

# Copy everything
COPY . .

# Fix for pnpm v10: allow scripts execution
RUN pnpm config set only-allow-approved-scripts false
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN cd apps/backend && pnpm exec prisma generate

# Build backend
RUN cd apps/backend && pnpm build

# Production
FROM node:18-alpine

RUN npm install -g pnpm@10.28.0

WORKDIR /app

# Copy workspace structure
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/backend ./apps/backend
COPY --from=builder /app/node_modules ./node_modules

WORKDIR /app/apps/backend

EXPOSE 3001

CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main.js"]
