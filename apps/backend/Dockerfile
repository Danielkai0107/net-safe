FROM node:18-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm@10.28.0

WORKDIR /app

# Copy all files from backend directory
COPY . .

# Install dependencies
RUN pnpm install

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN pnpm build

# Production stage
FROM node:18-alpine

# Install pnpm globally
RUN npm install -g pnpm@10.28.0

WORKDIR /app

# Copy package files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Copy Prisma files for migrations
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3001

# Run migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
