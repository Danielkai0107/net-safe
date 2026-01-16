# 🚀 Zeabur 部署指南

完整的 Safe-Net 專案部署到 Zeabur 平台指南。

---

## 📋 部署前準備

### 1. 生成的密鑰（已準備好）

```
JWT_SECRET=14bab22bbb66ef6c07d1c0d143d579542a74ce37bec4278e004c2844efa87bbd
JWT_APP_SECRET=7c0361ae0f37c6768e69a10a614076697945bacc422977f68a7bd0e2c18cb226
```

### 2. 必要帳號
- ✅ GitHub 帳號
- ✅ Zeabur 帳號（使用 GitHub 登入）

### 3. 代碼推送到 GitHub
```bash
# 如果還沒推送，執行：
git add .
git commit -m "準備部署到 Zeabur"
git push
```

---

## 🎯 部署步驟

### 第一步：創建 Zeabur 專案

1. **訪問 Zeabur**
   - 開啟 https://zeabur.com
   - 點擊「使用 GitHub 登入」

2. **創建新專案**
   - Dashboard → 點擊「新增專案」
   - 輸入專案名稱：`safe-net`
   - 選擇區域（建議：Hong Kong 或 Tokyo）

---

### 第二步：部署 PostgreSQL 資料庫

1. **添加資料庫服務**
   - 在專案頁面點擊「新增服務」
   - 選擇「Marketplace」
   - 搜尋並選擇「PostgreSQL」
   - 點擊「部署」

2. **等待部署完成**
   - 大約 1-2 分鐘
   - 狀態變為綠色「Running」即完成

3. **查看資料庫資訊**
   - 點擊 PostgreSQL 服務
   - 在「連接」頁籤可看到連接資訊
   - Zeabur 會自動注入 `POSTGRES_URL` 環境變數

---

### 第三步：部署後端 API

1. **添加後端服務**
   - 點擊「新增服務」
   - 選擇「Git」
   - 選擇您的 GitHub repo：`safe-net`
   - 點擊「部署」

2. **配置服務設定**
   - Service Name: `backend`
   - Root Directory: `apps/backend`
   - Branch: `main` (或您的主分支)

3. **設定環境變數**
   
   點擊後端服務 → 「變數」頁籤，添加以下變數：

   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=${POSTGRES_URL}
   JWT_SECRET=14bab22bbb66ef6c07d1c0d143d579542a74ce37bec4278e004c2844efa87bbd
   JWT_APP_SECRET=7c0361ae0f37c6768e69a10a614076697945bacc422977f68a7bd0e2c18cb226
   JWT_EXPIRES_IN=7d
   JWT_APP_EXPIRES_IN=30d
   CORS_ORIGIN=*
   LOG_LEVEL=log
   ```

   > 💡 `${POSTGRES_URL}` 會自動引用 PostgreSQL 服務的連接 URL

4. **等待部署完成**
   - 查看「部署」頁籤的日誌
   - 等待狀態變為「Running」
   - 大約需要 3-5 分鐘

5. **獲取後端 URL**
   - 點擊「網域」頁籤
   - Zeabur 會自動生成一個域名，例如：
     ```
     https://safe-net-backend-xxx.zeabur.app
     ```
   - **記下這個 URL，下一步會用到**

6. **執行資料庫遷移**
   
   點擊後端服務 → 「終端機」頁籤，執行：
   
   ```bash
   cd /zeabur/output
   npx prisma migrate deploy
   npx prisma db seed
   ```

   看到成功訊息即完成。

---

### 第四步：部署管理後台

1. **添加前端服務**
   - 點擊「新增服務」
   - 選擇「Git」
   - 選擇相同的 GitHub repo
   - 點擊「部署」

2. **配置服務設定**
   - Service Name: `admin`
   - Root Directory: `apps/admin`
   - Branch: `main`

3. **設定環境變數**
   
   使用您在第三步獲取的後端 URL：
   
   ```
   VITE_API_URL=https://safe-net-backend-xxx.zeabur.app/api
   ```

   > ⚠️ 注意：URL 結尾要加 `/api`

4. **等待部署完成**
   - 查看部署日誌
   - 等待狀態變為「Running」
   - 大約需要 2-3 分鐘

5. **獲取前端 URL**
   - 點擊「網域」頁籤
   - 取得管理後台的 URL，例如：
     ```
     https://safe-net-admin-xxx.zeabur.app
     ```

---

### 第五步：測試部署

#### 1. 測試後端 API

```bash
# 測試健康檢查
curl https://safe-net-backend-xxx.zeabur.app/api/health

# 測試登入（使用預設管理員帳號）
curl -X POST https://safe-net-backend-xxx.zeabur.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@safenet.com","password":"admin123456"}'
```

應該會返回包含 `access_token` 的 JSON。

#### 2. 測試管理後台

1. 開啟管理後台 URL
2. 使用預設帳號登入：
   - Email: `admin@safenet.com`
   - Password: `admin123456`
3. 檢查各個功能是否正常

---

### 第六步：更新移動 App 配置

1. **更新 API URL**
   
   編輯 `apps/mobile/src/config.local.ts`：

   ```typescript
   export const API_BASE_URL = 'https://safe-net-backend-xxx.zeabur.app/api';
   ```

2. **重新建置 App**
   
   ```bash
   cd apps/mobile
   
   # 使用 Expo Go 測試
   npx expo start
   
   # 或使用 EAS Build 發布
   npx eas build --platform all
   ```

3. **測試 App 連接**
   - 開啟 App
   - 測試登入功能
   - 測試資料載入

---

## 🔧 進階配置

### 自訂域名

如果您有自己的域名：

1. **在 Zeabur 添加自訂域名**
   - 服務頁面 → 「網域」頁籤
   - 點擊「新增域名」
   - 輸入您的域名：`api.your-domain.com`

2. **設定 DNS**
   - 在您的 DNS 提供商添加 CNAME 記錄
   - 指向 Zeabur 提供的目標

3. **更新環境變數**
   - 更新前端的 `VITE_API_URL`
   - 更新移動 App 的 `API_BASE_URL`
   - 更新後端的 `CORS_ORIGIN`（安全起見）

### HTTPS 強制重定向

Zeabur 預設已啟用 HTTPS，無需額外配置。

### 環境變數更新

如需更新環境變數：
1. 進入服務 → 「變數」頁籤
2. 修改變數值
3. 點擊「重新部署」

---

## 📊 監控和日誌

### 查看日誌

1. **即時日誌**
   - 服務頁面 → 「日誌」頁籤
   - 可以看到即時的應用程式日誌

2. **部署日誌**
   - 服務頁面 → 「部署」頁籤
   - 查看每次部署的建置日誌

### 監控指標

- 服務頁面 → 「指標」頁籤
- 可以看到：
  - CPU 使用率
  - 記憶體使用量
  - 網路流量

---

## 🔒 安全性建議

### 生產環境檢查清單

- [ ] **JWT 密鑰已更改**（不要使用本指南的範例密鑰）
- [ ] **CORS 設定已限制**
  ```
  CORS_ORIGIN=https://safe-net-admin-xxx.zeabur.app
  ```
- [ ] **預設管理員密碼已更改**
  - 登入後立即在後台修改密碼
- [ ] **資料庫密碼強度足夠**
- [ ] **定期備份資料庫**
- [ ] **啟用 Zeabur 的監控告警**

### 更新 JWT 密鑰

如果要使用不同的密鑰：

```bash
# 生成新密鑰
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 在 Zeabur 更新環境變數
# 然後重新部署服務
```

---

## ❓ 常見問題

### Q: 後端部署失敗

**可能原因：**
- Node.js 版本不符（需要 18+）
- 環境變數設定錯誤
- Prisma 遷移失敗

**解決方式：**
1. 檢查「部署」頁籤的錯誤日誌
2. 確認所有環境變數都正確設定
3. 手動在終端機執行遷移命令

### Q: 前端無法連接後端

**檢查項目：**
- [ ] `VITE_API_URL` 設定正確且包含 `/api`
- [ ] 後端服務正在運行（綠色 Running 狀態）
- [ ] CORS 設定允許前端域名
- [ ] 瀏覽器控制台沒有 CORS 錯誤

### Q: 資料庫連接失敗

**檢查項目：**
- [ ] PostgreSQL 服務正在運行
- [ ] `DATABASE_URL` 正確設定為 `${POSTGRES_URL}`
- [ ] 已執行 Prisma 遷移

### Q: App 無法連接

**檢查項目：**
- [ ] `config.local.ts` 中的 URL 正確
- [ ] 使用完整的 HTTPS URL
- [ ] 後端 CORS 允許所有來源（`*`）
- [ ] 網路連接正常

---

## 💰 費用估算

### Zeabur 定價

| 資源 | 用量 | 預估費用/月 |
|------|------|------------|
| PostgreSQL | 小型 | $5 |
| 後端 API | 基礎 | $5 |
| 管理後台 | 靜態託管 | $2 |
| **總計** | | **~$12** |

> 💡 Zeabur 提供 $5 免費額度，實際可能只需支付 $7/月

### 成本優化建議

1. **開發環境分離**
   - 創建獨立的開發專案
   - 只在需要時啟動

2. **資源監控**
   - 定期檢查使用量
   - 調整服務規模

3. **使用免費資料庫**
   - 考慮使用 Supabase 免費版
   - 或 Neon 的免費層

---

## 🔄 持續部署 (CI/CD)

Zeabur 已自動設定 CI/CD：

1. **自動部署**
   - 每次推送到 GitHub 主分支
   - Zeabur 會自動重新部署

2. **部署通知**
   - 可以在設定中啟用 Slack/Discord 通知
   - 或接收 Email 通知

3. **回滾功能**
   - 在「部署」頁籤可以看到歷史版本
   - 點擊任何版本可以快速回滾

---

## 📞 支援和幫助

### Zeabur 官方資源
- 📚 文檔：https://zeabur.com/docs
- 💬 Discord：https://discord.gg/zeabur
- 📧 Email：support@zeabur.com

### Safe-Net 專案
- 查看 `DEPLOY_GUIDE.md` 了解其他部署選項
- 查看 `TROUBLESHOOTING_STEPS.md` 排查問題

---

## ✅ 部署完成檢查清單

部署完成後，確認以下項目：

- [ ] PostgreSQL 服務運行正常
- [ ] 後端 API 可以訪問
- [ ] 管理後台可以登入
- [ ] App 可以連接後端
- [ ] 已執行資料庫遷移和種子數據
- [ ] 已更改預設管理員密碼
- [ ] 已設定 CORS 限制（生產環境）
- [ ] 已測試所有主要功能
- [ ] 已設定監控告警
- [ ] 已備份資料庫

---

## 🎉 部署成功！

恭喜您成功將 Safe-Net 部署到 Zeabur！

**接下來可以：**
1. 📱 發布移動 App 到 App Store / Google Play
2. 🎨 自訂管理後台的品牌樣式
3. 📊 設定監控和告警
4. 🔒 加強安全性設定
5. 📈 開始使用並收集用戶反饋

**需要幫助？**
- 查看本專案的其他文檔
- 加入 Zeabur Discord 社群
- 聯繫技術支援

祝您使用愉快！🚀
