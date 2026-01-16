# 🎯 最終修復步驟

## 📊 當前狀況

### ✅ 已確認
- 資料庫有 1 個社區（大愛社區）
- 資料庫有多個測試用戶
- .env 文件有 JWT_APP_SECRET 配置
- Token 可以生成

### ❌ 問題
- Token 驗證失敗（jsonwebtoken.verify 階段）
- 環境變量可能沒有被正確載入
- 調試日誌沒有出現

---

## 🚀 解決方案：完全重啟

### 為什麼需要完全重啟？

```
問題：NestJS/Turbo 的熱重載不會重新讀取 .env 文件！

解釋：
┌─────────────────────────────────────┐
│ 1. 啟動時讀取 .env → process.env    │
│ 2. 修改 .env 文件                    │
│ 3. 熱重載只更新 TypeScript 代碼     │
│ 4. process.env 仍然是舊值            │
│                                      │
│ 解決：必須停止進程並重新啟動         │
└─────────────────────────────────────┘
```

---

## 📋 執行步驟

### 第 1 步：停止所有服務

在運行 `pnpm dev` 的終端中：
```bash
按 Ctrl+C 停止
```

等待看到進程完全停止。

### 第 2 步：確認進程已停止

```bash
lsof -ti:3001 && echo "❌ 還在運行，請再次按 Ctrl+C" || echo "✅ 已停止"
```

如果還在運行：
```bash
lsof -ti:3001 | xargs kill -9
```

### 第 3 步：重新啟動

```bash
cd /Users/danielkai/Desktop/safe-net
pnpm dev
```

### 第 4 步：等待啟動並查看日誌

**重要**：看到以下訊息：
```
🔍 Environment Variables Check:
  JWT_APP_SECRET: app-secret-key-cha...  ← 應該顯示這個！
  NODE_ENV: development
  PORT: 3001

...

[Nest] Application successfully started
```

**如果看到 `JWT_APP_SECRET: ❌ NOT SET`**，說明 .env 文件沒有被讀取！

### 第 5 步：測試後端

在**新終端**運行：

```bash
# 1. 註冊新用戶
TOKEN=$(curl -s -X POST http://localhost:3001/api/app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Final Test","email":"final'$(date +%s)'@test.com","password":"pass123"}' \
  | jq -r '.data.data.access_token')

echo "Token: ${TOKEN:0:50}..."

# 2. 用 token 訪問社區列表
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/app/tenants | jq '.'
```

**預期結果：**
```json
{
  "data": [
    {
      "id": "...",
      "code": "DALOVE001",
      "name": "大愛社區",
      "isActive": true,
      ...
    }
  ],
  "timestamp": "..."
}
```

**成功標誌：**
- ✅ 不是 401 錯誤
- ✅ 返回社區列表（有 1 個社區）
- ✅ 後端日誌顯示：`[JwtAppStrategy] Validating payload`

---

## 🔍 如果還是失敗

### 檢查點 1：.env 文件位置

```bash
# 確認文件存在
ls -la /Users/danielkai/Desktop/safe-net/apps/backend/.env

# 確認內容正確
cat /Users/danielkai/Desktop/safe-net/apps/backend/.env
```

應該包含：
```env
JWT_APP_SECRET=app-secret-key-change-in-production
```

### 檢查點 2：環境變量載入

如果啟動日誌顯示 `JWT_APP_SECRET: ❌ NOT SET`，可能是：

1. **.env 文件位置錯誤**
   ```bash
   # 移動到正確位置
   cp /Users/danielkai/Desktop/safe-net/apps/backend/.env \
      /Users/danielkai/Desktop/safe-net/.env
   ```

2. **dotenv 沒有配置**
   
   檢查 `apps/backend/package.json` 是否有：
   ```json
   {
     "scripts": {
       "dev": "dotenv -e .env ts-node -r tsconfig-paths/register src/main.ts"
     }
   }
   ```

### 檢查點 3：清除緩存

```bash
cd /Users/danielkai/Desktop/safe-net
rm -rf apps/backend/dist apps/backend/.turbo node_modules/.cache
pnpm dev
```

---

## 🎯 App 端測試

### 前提：後端測試必須成功！

只有當步驟 5 的測試成功後，才進行 App 測試。

### 清除 App 數據

```bash
# Android
adb shell pm clear com.safenet.app

# 或者重新安裝
cd apps/mobile
npx expo run:android --device
```

### 登入測試

1. 開啟 App
2. 註冊新帳號或登入現有帳號
3. 檢查：
   - ✅ 可以看到「加入社區」選項
   - ✅ 點擊後可以看到「大愛社區」
   - ✅ 可以申請加入

---

## 📝 後台管理測試

### 1. 登入後台

```
http://localhost:5173
```

### 2. 將 App 用戶添加到社區

1. 進入「社區管理」
2. 點擊「大愛社區」的「App 成員管理」
3. 點擊「新增成員」
4. 選擇剛註冊的用戶
5. 選擇角色（一般成員/管理員）
6. 點擊「新增」

### 3. App 端驗證

1. 重新開啟 App 或下拉刷新
2. 應該能在「我的社區」看到「大愛社區」
3. 應該能看到長輩列表（如果有資料）

---

## 🐛 調試技巧

### 查看實時後端日誌

```bash
tail -f /Users/danielkai/.cursor/projects/Users-danielkai-Desktop-safe-net/terminals/24.txt
```

尋找：
- `[JwtAppStrategy] Validating payload` ← Token 驗證開始
- `[JwtAppStrategy] User found: { found: true }` ← 驗證成功
- `UnauthorizedException` ← 驗證失敗

### 測試 Token 內容

```bash
TOKEN="eyJ..."  # 你的 token
echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq '.'
```

應該看到：
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### 手動驗證 JWT

使用 https://jwt.io：
1. 貼上 token
2. 在 "VERIFY SIGNATURE" 輸入：`app-secret-key-change-in-production`
3. 應該顯示 "Signature Verified"

---

## 💡 成功後的下一步

1. **生產環境部署**
   - 更改 JWT_APP_SECRET 為強密碼
   - 使用環境變量管理

2. **創建測試數據**
   - 添加更多社區
   - 添加長輩資料
   - 創建測試警報

3. **功能測試**
   - 測試完整的用戶流程
   - 測試管理員功能
   - 測試警報系統

---

## ⚠️ 重要提醒

1. **每次修改 .env 都需要重啟**
2. **每次更改 JWT Secret 都需要清除所有 token**
3. **開發環境使用簡單的 Secret，生產環境使用強密碼**

---

## 📞 需要協助

如果按照以上步驟還是無法解決，請提供：

1. **完整的啟動日誌**（從啟動到出錯的所有輸出）
2. **環境變量檢查結果**（啟動日誌中的 `🔍 Environment Variables Check`）
3. **測試命令的完整輸出**
4. **錯誤訊息截圖**

祝您成功！🎉
