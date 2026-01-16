# 🌐 網路配置完整指南

## 問題說明

**為什麼切換 WiFi 後前端抓不到後端資料？**

因為前端配置使用了**固定的 IP 地址**或 `localhost`：
- 在 WiFi A 時，您的電腦 IP 是 `192.168.1.100`
- 切換到 WiFi B 後，IP 變成 `192.168.50.200`
- 但配置文件還是 `192.168.1.100`，導致無法連接

---

## 🎯 解決方案總覽

### 方案 1️⃣：自動 IP 檢測（開發環境推薦）⭐

**優點**：
- ✅ 切換網路後只需執行一個命令
- ✅ 自動更新所有配置文件
- ✅ 適合頻繁切換網路的開發場景

**使用方法**：

```bash
# 切換 WiFi 後執行此命令
pnpm update-ip

# 查看當前網路資訊
pnpm show-ip
```

這會自動更新：
- `apps/admin/.env` - Admin 前端配置
- `apps/mobile/src/config.local.ts` - Mobile App 配置

---

### 方案 2️⃣：使用 mDNS (.local 域名)

**優點**：
- ✅ 不需要知道 IP 地址
- ✅ 切換網路後無需修改配置
- ✅ macOS/iOS 原生支援

**配置方法**：

1. 查看您的電腦名稱：
```bash
hostname
# 輸出例如：MacBook-Pro
```

2. 修改配置文件使用 `.local` 域名：

**Admin 前端** (`apps/admin/.env`):
```env
VITE_API_URL=http://MacBook-Pro.local:3001/api
```

**Mobile App** (`apps/mobile/src/config.local.ts`):
```typescript
export const API_BASE_URL = 'http://MacBook-Pro.local:3001/api';
```

⚠️ **注意**：
- Android 設備可能不支援 mDNS
- 需確保電腦名稱沒有空格或特殊字元

---

### 方案 3️⃣：部署後端到雲端（生產環境）🚀

**優點**：
- ✅ 一勞永逸，任何網路都能訪問
- ✅ 不依賴本機開發環境
- ✅ 適合團隊協作和測試

**推薦平台**：

#### A. Railway（最簡單）

1. 註冊 [Railway.app](https://railway.app)

2. 安裝 Railway CLI：
```bash
npm i -g @railway/cli
```

3. 部署：
```bash
cd apps/backend
railway login
railway init
railway up
```

4. 獲取部署 URL（例如：`https://your-app.railway.app`）

5. 更新前端配置：
```env
# apps/admin/.env
VITE_API_URL=https://your-app.railway.app/api

# apps/mobile/src/config.local.ts
export const API_BASE_URL = 'https://your-app.railway.app/api';
```

**費用**：每月免費 5 美元額度

---

#### B. Render（免費方案）

1. 註冊 [Render.com](https://render.com)

2. 創建新的 Web Service

3. 連接您的 GitHub repo

4. 配置：
   - Build Command: `cd apps/backend && npm install && npm run build`
   - Start Command: `cd apps/backend && npm run start:prod`
   - Environment Variables: 添加所有必要的環境變數

5. 部署後獲取 URL

**費用**：免費（但會自動休眠，需要暖機時間）

---

#### C. Fly.io（Docker 部署）

1. 安裝 Fly CLI：
```bash
curl -L https://fly.io/install.sh | sh
```

2. 登入：
```bash
fly auth login
```

3. 在後端目錄創建 `Dockerfile`：
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

4. 部署：
```bash
cd apps/backend
fly launch
fly deploy
```

**費用**：每月免費額度

---

#### D. 使用 Ngrok（臨時方案）

適合短期測試或展示：

1. 安裝 ngrok：
```bash
brew install ngrok
```

2. 啟動後端：
```bash
cd apps/backend
pnpm dev
```

3. 在另一個終端啟動 ngrok：
```bash
ngrok http 3001
```

4. Ngrok 會給您一個公開 URL，例如：
```
https://abc123.ngrok.io
```

5. 更新前端配置使用這個 URL：
```env
VITE_API_URL=https://abc123.ngrok.io/api
```

⚠️ **注意**：
- 免費版每次重啟 URL 都會改變
- 付費版可以固定 URL

---

## 📋 快速命令參考

### 開發環境（方案 1）

```bash
# 切換 WiFi 後執行
pnpm update-ip

# 查看網路資訊
pnpm show-ip

# 啟動後端
cd apps/backend && pnpm dev

# 啟動 Admin 前端
cd apps/admin && pnpm dev

# 啟動 Mobile App
cd apps/mobile && pnpm android
```

---

## 🔧 手動配置指南

如果自動腳本不起作用，您可以手動配置：

### 1. 獲取本機 IP

**macOS/Linux**:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'
```

**Windows**:
```cmd
ipconfig | findstr IPv4
```

### 2. 更新 Admin 配置

編輯 `apps/admin/.env`:
```env
VITE_API_URL=http://YOUR_IP:3001/api
```

例如：
```env
VITE_API_URL=http://192.168.1.100:3001/api
```

### 3. 更新 Mobile 配置

編輯 `apps/mobile/src/config.local.ts`:
```typescript
export const API_BASE_URL = 'http://YOUR_IP:3001/api';
```

### 4. 重啟服務

**重要**：修改配置後必須重啟！

```bash
# 重啟 Admin（按 Ctrl+C 停止，然後）
cd apps/admin && pnpm dev

# Mobile App 需要重新編譯
cd apps/mobile && pnpm android
```

---

## 🎯 推薦方案選擇

| 場景 | 推薦方案 | 原因 |
|------|----------|------|
| 本地開發，頻繁切換 WiFi | 方案 1（自動 IP） | 一條命令搞定 |
| 本地開發，固定 WiFi | 方案 2（mDNS） | 無需重新配置 |
| 團隊協作/遠程測試 | 方案 3（雲端部署） | 穩定可靠 |
| 臨時展示/測試 | Ngrok | 快速分享 |

---

## 💡 最佳實踐

### 開發環境建議

1. **使用自動 IP 腳本**：
   ```bash
   # 每天開始工作前執行一次
   pnpm update-ip
   ```

2. **在 Admin 前端添加 API 狀態檢測**：
   ```typescript
   // 在登入頁顯示 API 連接狀態
   useEffect(() => {
     fetch(`${API_URL}/health`)
       .then(() => setApiStatus('connected'))
       .catch(() => setApiStatus('disconnected'));
   }, []);
   ```

3. **Mobile App 添加錯誤提示**：
   ```typescript
   // 當網路錯誤時，顯示當前 API URL
   if (error.message === 'Network Error') {
     Alert.alert(
       '無法連接服務器',
       `請檢查 API 配置：${config.apiBaseUrl}`
     );
   }
   ```

---

## 🚀 生產環境部署檢查清單

部署到雲端前請確認：

- [ ] 已設定正確的環境變數
- [ ] JWT_SECRET 使用強密碼
- [ ] 資料庫已遷移到雲端（如 Supabase, PlanetScale）
- [ ] CORS 設定正確的來源
- [ ] 已啟用 HTTPS
- [ ] 前端配置使用生產環境 URL
- [ ] 已測試所有 API 端點

---

## 🐛 常見問題排查

### Q: 執行 `pnpm update-ip` 後還是連不上？

**檢查**：
1. 後端是否正在運行？
   ```bash
   curl http://YOUR_IP:3001/api/health
   ```

2. 防火牆是否阻擋？
   - macOS: 系統偏好設定 → 安全性與隱私 → 防火牆
   - 允許 Node 接受傳入連接

3. 前端是否重啟？
   - Admin 需要重新執行 `pnpm dev`
   - Mobile App 需要重新編譯

### Q: Android 實體設備連不上？

**解決方法**：
1. 確保手機和電腦在同一個 WiFi
2. 使用電腦的局域網 IP（不是 localhost）
3. 確認防火牆允許連接

### Q: iOS 實體設備連不上？

**解決方法**：
1. 使用 mDNS：`http://Your-Mac-Name.local:3001/api`
2. 或使用 IP 地址
3. 確保 Info.plist 允許 HTTP 連接（如未使用 HTTPS）

### Q: Railway/Render 部署後 502 錯誤？

**檢查**：
1. 環境變數是否正確設定？
2. 資料庫 URL 是否可訪問？
3. PORT 是否使用環境變數？
   ```typescript
   const port = process.env.PORT || 3001;
   ```

---

## 📞 需要幫助？

如果以上方案都無法解決問題：

1. 檢查錯誤日誌：
   ```bash
   # 後端日誌
   cd apps/backend && pnpm dev
   
   # 前端控制台（F12）
   # Mobile App Logcat
   npx react-native log-android
   ```

2. 測試網路連接：
   ```bash
   # 測試後端是否運行
   curl http://localhost:3001/api/health
   
   # 測試 IP 是否可訪問
   curl http://YOUR_IP:3001/api/health
   ```

3. 確認配置文件：
   ```bash
   # 查看 Admin 配置
   cat apps/admin/.env
   
   # 查看 Mobile 配置
   cat apps/mobile/src/config.local.ts
   ```

---

**最後更新**: 2026-01-16
