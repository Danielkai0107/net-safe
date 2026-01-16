FROM node:18-alpine AS builder

# 安裝 pnpm
RUN npm install -g pnpm@10.28.0

WORKDIR /app

# 複製所有檔案
COPY . .

# 關鍵修正 1：透過 .npmrc 強制解除 pnpm v10 的腳本限制
RUN echo "only-allow-approved-scripts=false" > .npmrc

# 關鍵修正 2：確保安裝所有依賴
RUN pnpm install --frozen-lockfile

# 關鍵修正 3：先在資料庫套件生成 Prisma Client (因為後端依賴它)
RUN pnpm --filter @repo/database exec prisma generate

# 關鍵修正 4：在後端也生成一次 (如果後端有獨立 schema 設定)
RUN pnpm --filter @repo/backend exec prisma generate

# 編譯後端
RUN pnpm --filter @repo/backend build

# 生產環境
FROM node:18-alpine

RUN npm install -g pnpm@10.28.0

WORKDIR /app

# 複製必要的檔案
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/backend ./apps/backend
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.npmrc ./

WORKDIR /app/apps/backend

EXPOSE 3001

# 啟動時執行遷移
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main.js"]
