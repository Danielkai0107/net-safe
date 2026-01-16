# ⚡ 快速部署指南

5 分鐘快速部署 Safe-Net 到 Zeabur！

---

## 🎯 部署前準備（2 分鐘）

### 1. 檢查部署準備

```bash
# 執行部署檢查
node scripts/deploy-check.js
```

### 2. 推送到 GitHub

```bash
git add .
git commit -m "準備部署到 Zeabur"
git push
```

---

## 🚀 開始部署（3 分鐘）

### 步驟 1：創建 Zeabur 專案

1. 訪問 https://zeabur.com
2. 使用 GitHub 登入
3. 創建新專案：`safe-net`

### 步驟 2：部署資料庫

1. 新增服務 → Marketplace → PostgreSQL
2. 等待部署完成（約 1 分鐘）

### 步驟 3：部署後端

1. 新增服務 → Git → 選擇您的 repo
2. Root Directory: `apps/backend`
3. 添加環境變數（複製 `apps/backend/env.example.txt` 的內容）
4. 等待部署完成（約 3 分鐘）
5. 在終端機執行：
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### 步驟 4：部署前端

1. 新增服務 → Git → 選擇相同 repo
2. Root Directory: `apps/admin`
3. 環境變數：`VITE_API_URL=https://你的後端URL.zeabur.app/api`
4. 等待部署完成（約 2 分鐘）

### 步驟 5：更新 App

```bash
# 獲取後端 URL 後執行：
node scripts/update-mobile-config.js https://你的後端URL.zeabur.app

# 重新建置
cd apps/mobile
npx expo start
```

---

## ✅ 測試部署

```bash
# 測試後端
curl https://你的後端URL.zeabur.app/api/health

# 測試登入
curl -X POST https://你的後端URL.zeabur.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@safenet.com","password":"admin123456"}'
```

---

## 📚 更多資訊

- 詳細指南：`ZEABUR_DEPLOY_GUIDE.md`
- 其他部署選項：`DEPLOY_GUIDE.md`
- 故障排除：`TROUBLESHOOTING_STEPS.md`

---

## 🔑 預設帳號

**管理後台：**
- Email: `admin@safenet.com`
- Password: `admin123456`

⚠️ **部署後請立即更改密碼！**

---

## 💡 實用命令

```bash
# 生成新密鑰
node scripts/generate-secrets.js

# 檢查部署準備
node scripts/deploy-check.js

# 更新 App 配置
node scripts/update-mobile-config.js <backend-url>

# 查看本機 IP（開發用）
node scripts/get-local-ip.js
```

---

**準備好了嗎？開始部署吧！** 🚀
