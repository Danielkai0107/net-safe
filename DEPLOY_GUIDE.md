# 🚀 Safe-Net 後端部署指南

本指南提供多種後端部署方案，讓您的 App 和管理後台在任何網路環境下都能正常運作。

---

## 📋 部署前準備

### 1. 必要的環境變數

```env
# 資料庫
DATABASE_URL=postgresql://username:password@host:5432/database

# JWT 密鑰
JWT_SECRET=your-super-secret-jwt-key
JWT_APP_SECRET=your-super-secret-app-jwt-key
JWT_EXPIRES_IN=7d
JWT_APP_EXPIRES_IN=30d

# 應用設定
NODE_ENV=production
PORT=3001

# CORS（根據前端域名調整）
CORS_ORIGIN=https://your-admin-domain.com,https://your-app-domain.com
```

### 2. 資料庫準備

**選項 A：使用雲端資料庫**

推薦服務：
- [Supabase](https://supabase.com) - PostgreSQL，免費額度充足
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [PlanetScale](https://planetscale.com) - MySQL（需調整 Prisma）
- [Railway](https://railway.app) - 內建 PostgreSQL

**選項 B：繼續使用 Docker**

如果部署到 VPS，可以繼續使用 Docker Compose。

---

## 方案 1️⃣：Railway（最推薦）⭐

**優點**：
- ✅ 極簡單，5 分鐘部署
- ✅ 內建資料庫
- ✅ 自動 HTTPS
- ✅ 每月 $5 免費額度

### 步驟

1. **註冊 Railway**
   - 訪問 https://railway.app
   - 使用 GitHub 登入

2. **安裝 CLI**
   ```bash
   npm install -g @railway/cli
   ```

3. **準備後端**
   ```bash
   cd apps/backend
   
   # 確保有 start:prod 腳本
   # package.json 應包含：
   # "start:prod": "node dist/main.js"
   ```

4. **初始化並部署**
   ```bash
   railway login
   railway init
   railway add # 選擇 PostgreSQL
   railway up
   ```

5. **設定環境變數**
   
   在 Railway Dashboard 設定：
   - `DATABASE_URL` - Railway 會自動提供
   - `JWT_SECRET` - 自己生成強密碼
   - `JWT_APP_SECRET` - 自己生成強密碼
   - `NODE_ENV` = `production`
   - `CORS_ORIGIN` = `*`（或您的前端域名）

6. **執行資料庫遷移**
   ```bash
   railway run pnpm prisma migrate deploy
   railway run pnpm prisma db seed
   ```

7. **獲取 URL**
   
   Railway 會提供類似：`https://your-app.railway.app`

8. **更新前端配置**
   ```env
   # apps/admin/.env
   VITE_API_URL=https://your-app.railway.app/api
   
   # apps/mobile/src/config.local.ts
   export const API_BASE_URL = 'https://your-app.railway.app/api';
   ```

---

## 方案 2️⃣：Render

**優點**：
- ✅ 免費方案（有限制）
- ✅ 自動從 GitHub 部署
- ✅ 簡單易用

**缺點**：
- ⚠️ 免費版會自動休眠（15分鐘無活動）
- ⚠️ 暖機時間較長（首次請求可能需要 30 秒）

### 步驟

1. **準備 GitHub Repo**
   ```bash
   # 確保您的代碼已推送到 GitHub
   git add .
   git commit -m "Prepare for deployment"
   git push
   ```

2. **註冊 Render**
   - 訪問 https://render.com
   - 使用 GitHub 登入

3. **創建資料庫**
   - Dashboard → New → PostgreSQL
   - 選擇免費方案
   - 複製 `Internal Database URL`

4. **創建 Web Service**
   - Dashboard → New → Web Service
   - 連接您的 GitHub repo
   - 配置：
     ```
     Name: safe-net-api
     Environment: Node
     Build Command: cd apps/backend && npm install && npm run build
     Start Command: cd apps/backend && npm run start:prod
     ```

5. **設定環境變數**
   - `DATABASE_URL` - 貼上步驟 3 的資料庫 URL
   - `JWT_SECRET` - 自己生成
   - `JWT_APP_SECRET` - 自己生成
   - `NODE_ENV` = `production`
   - `PORT` = `10000`（Render 預設）
   - `CORS_ORIGIN` = `*`

6. **等待部署完成**
   - 首次可能需要 5-10 分鐘
   - 完成後會獲得 URL：`https://safe-net-api.onrender.com`

7. **執行資料庫遷移**
   
   在 Render Shell 中執行：
   ```bash
   cd apps/backend
   npx prisma migrate deploy
   npx prisma db seed
   ```

---

## 方案 3️⃣：Fly.io

**優點**：
- ✅ 效能好
- ✅ 支援 Docker
- ✅ 全球多區域部署

### 步驟

1. **安裝 Fly CLI**
   ```bash
   # macOS
   brew install flyctl
   
   # Linux/WSL
   curl -L https://fly.io/install.sh | sh
   ```

2. **登入**
   ```bash
   fly auth login
   ```

3. **準備 Dockerfile**
   
   在 `apps/backend` 創建 `Dockerfile`：
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   COPY prisma ./prisma/
   RUN npm install
   COPY . .
   RUN npm run build
   RUN npx prisma generate
   
   FROM node:18-alpine
   WORKDIR /app
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/package*.json ./
   COPY --from=builder /app/prisma ./prisma
   
   EXPOSE 3001
   CMD ["npm", "run", "start:prod"]
   ```

4. **初始化並部署**
   ```bash
   cd apps/backend
   fly launch
   # 跟著提示操作，選擇區域
   
   fly deploy
   ```

5. **創建資料庫**
   ```bash
   fly postgres create
   fly postgres attach <postgres-app-name>
   ```

6. **設定環境變數**
   ```bash
   fly secrets set JWT_SECRET=your-secret
   fly secrets set JWT_APP_SECRET=your-app-secret
   fly secrets set NODE_ENV=production
   ```

7. **執行遷移**
   ```bash
   fly ssh console
   cd app
   npx prisma migrate deploy
   npx prisma db seed
   ```

---

## 方案 4️⃣：Vercel + Serverless（進階）

⚠️ **注意**：NestJS 不完全適合 Serverless，需要調整架構。

更適合：
- Next.js API Routes
- Express.js 精簡版

**不建議**用於此專案（除非重構後端）。

---

## 方案 5️⃣：自架 VPS（完全掌控）

**適合**：
- 需要完全掌控
- 預算充足
- 有運維經驗

### 推薦服務商

- DigitalOcean Droplet（$5/月起）
- Linode（$5/月起）
- AWS Lightsail（$3.5/月起）
- Hetzner（€3.79/月起，歐洲）

### 基本步驟

1. **創建 VPS**
   - 選擇 Ubuntu 22.04 LTS
   - 至少 1GB RAM

2. **初始設定**
   ```bash
   # SSH 連接
   ssh root@your-vps-ip
   
   # 更新系統
   apt update && apt upgrade -y
   
   # 安裝 Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt install -y nodejs
   
   # 安裝 pnpm
   npm install -g pnpm
   
   # 安裝 PM2（進程管理）
   npm install -g pm2
   
   # 安裝 Nginx
   apt install -y nginx
   
   # 安裝 Docker（資料庫）
   curl -fsSL https://get.docker.com | sh
   ```

3. **部署代碼**
   ```bash
   # 克隆 repo
   cd /var/www
   git clone https://github.com/your-username/safe-net.git
   cd safe-net
   
   # 安裝依賴
   pnpm install
   
   # 建置後端
   cd apps/backend
   pnpm build
   ```

4. **啟動資料庫**
   ```bash
   cd /var/www/safe-net
   docker compose up -d
   ```

5. **設定環境變數**
   ```bash
   # 創建 .env
   nano apps/backend/.env
   # 貼上您的環境變數
   ```

6. **啟動後端**
   ```bash
   cd apps/backend
   pm2 start dist/main.js --name safe-net-api
   pm2 save
   pm2 startup
   ```

7. **配置 Nginx**
   ```bash
   nano /etc/nginx/sites-available/safe-net
   ```
   
   內容：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
   
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   ln -s /etc/nginx/sites-available/safe-net /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

8. **設定 HTTPS（Let's Encrypt）**
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d your-domain.com
   ```

---

## 🔒 安全性檢查清單

部署前請確認：

- [ ] 使用強隨機密碼作為 JWT_SECRET
- [ ] CORS 設定限制來源（不要用 `*`）
- [ ] 資料庫使用強密碼
- [ ] 啟用 HTTPS
- [ ] 設定 Rate Limiting
- [ ] 更新所有依賴套件
- [ ] 不要在代碼中硬編碼密鑰
- [ ] 使用環境變數
- [ ] 定期備份資料庫

---

## 📊 部署後測試

1. **測試 API 健康檢查**
   ```bash
   curl https://your-api-domain.com/api/health
   ```

2. **測試登入**
   ```bash
   curl -X POST https://your-api-domain.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@safenet.com","password":"admin123456"}'
   ```

3. **更新前端並測試**
   - 更新 Admin 和 Mobile 的 API URL
   - 測試登入、資料載入等功能

---

## 💰 費用比較

| 方案 | 免費額度 | 付費價格 | 適合 |
|------|----------|----------|------|
| Railway | $5/月 | $5+ | 小型專案 |
| Render | 有（限制多） | $7/月起 | 測試環境 |
| Fly.io | 有限 | 依用量 | 生產環境 |
| Vercel | 不適用 | - | - |
| VPS | - | $3.5+/月 | 完全掌控 |

---

## 🎯 推薦選擇

| 情境 | 推薦 |
|------|------|
| 個人開發/測試 | Railway |
| 小型生產環境 | Railway + Supabase |
| 中大型專案 | Fly.io + Neon |
| 需要完全掌控 | VPS + Docker |
| 預算極少 | Render（接受暖機時間） |

---

## 📞 部署問題排查

### 部署失敗

1. 檢查建置日誌
2. 確認 Node 版本（建議 18+）
3. 確認所有依賴已安裝

### 無法連接資料庫

1. 檢查 DATABASE_URL 格式
2. 確認資料庫服務運行中
3. 檢查網路/防火牆設定

### API 回傳 500 錯誤

1. 檢查後端日誌
2. 確認環境變數正確
3. 執行資料庫遷移

### CORS 錯誤

1. 檢查 CORS_ORIGIN 設定
2. 確認前端 URL 在允許列表中
3. 檢查是否包含協議（http:// 或 https://）

---

**準備好了嗎？選擇一個方案開始部署吧！** 🚀
