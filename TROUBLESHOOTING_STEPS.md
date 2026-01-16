# 🔧 故障排除步驟

## 當前狀態
- ✅ 環境變量已配置（JWT_APP_SECRET）
- ✅ Response Interceptor 已修復
- ⚠️ 後端需要重啟
- ⚠️ App 需要清除舊 token

---

## 📋 完整修復流程

### 第 1 步：確認後端已停止
我已經停止了後端進程（PID: 38564）

### 第 2 步：重啟後端
```bash
# 在之前運行 pnpm dev 的終端中
cd /Users/danielkai/Desktop/safe-net
pnpm dev
```

**等待看到：**
```
[Nest] Application successfully started
```

### 第 3 步：驗證環境變量
```bash
# 新開一個終端，運行：
cat apps/backend/.env | grep JWT_APP_SECRET
```

應該看到：
```
JWT_APP_SECRET=app-secret-key-change-in-production
```

### 第 4 步：測試後端 API
```bash
# 測試註冊（會生成新 token）
curl -X POST http://localhost:3001/api/app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test999@example.com",
    "password": "password123"
  }'
```

應該返回：
```json
{
  "data": {
    "data": {
      "access_token": "eyJ...",
      "user": { ... }
    }
  }
}
```

### 第 5 步：清除 App 數據
**重要！舊的 token 是用舊配置生成的，無法用新配置驗證！**

#### 方法 A：清除應用數據（推薦）
1. Android 設置
2. 應用程式管理
3. Safe Net
4. 儲存空間
5. 清除數據

#### 方法 B：重新安裝
```bash
cd /Users/danielkai/Desktop/safe-net/apps/mobile
npx expo run:android --device
```

### 第 6 步：重新登入 App
1. 開啟 App
2. 輸入帳號密碼
3. 點擊登入

### 第 7 步：查看日誌驗證

#### App 端日誌應該顯示：
```
✅ [Storage] Token saved successfully
✅ [ApiClient] Request interceptor: {"hasToken": true, ...}
✅ 長輩列表載入成功（或顯示空列表，但不是 401 錯誤）
```

#### 後端日誌應該顯示：
```
✅ [JwtAppStrategy] Validating payload: { sub: 'xxx', email: 'xxx@example.com' }
✅ [JwtAppStrategy] User found: { found: true, isActive: true }
```

---

## 🐛 如果還是失敗

### 檢查點 1：確認後端使用了新的環境變量
```bash
# 在後端日誌中搜尋啟動訊息
tail -100 ~/.cursor/projects/Users-danielkai-Desktop-safe-net/terminals/24.txt | grep "Application successfully started"
```

如果沒有看到新的啟動訊息，說明後端還沒重啟。

### 檢查點 2：確認 JWT Secret 一致性
```bash
# 檢查環境變量文件
cat apps/backend/.env
```

確保有：
```
JWT_APP_SECRET=app-secret-key-change-in-production
```

### 檢查點 3：查看詳細錯誤
```bash
# 查看後端完整錯誤
tail -50 ~/.cursor/projects/Users-danielkai-Desktop-safe-net/terminals/24.txt
```

尋找：
- `JwtAppStrategy` 的日誌
- `Unauthorized` 的具體原因
- Token 解析錯誤

### 檢查點 4：手動測試 Token 驗證
```bash
# 1. 登入獲取 token
TOKEN=$(curl -s -X POST http://localhost:3001/api/app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.data.data.access_token')

echo "Token: $TOKEN"

# 2. 使用 token 訪問受保護端點
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/app/auth/me
```

---

## 🔍 常見問題

### Q1: 後端重啟後還是 401？
**A:** 確保清除了 App 數據。舊 token 無法用新配置驗證。

### Q2: 看不到 [JwtAppStrategy] 日誌？
**A:** 說明 JWT 驗證在更早階段就失敗了，可能是：
- Token 格式錯誤
- Authorization header 格式錯誤
- Token 無法解析

### Q3: Token 一直被清除？
**A:** 已修復 Response Interceptor，現在只有在真正 token 過期時才會清除。

### Q4: 還是看到 "hasToken: false"？
**A:** 檢查：
1. Storage 是否正確保存 token
2. ApiClient 是否正確讀取 token
3. App 是否真的清除了數據

---

## 📊 診斷命令集合

```bash
# 1. 檢查後端進程
lsof -ti:3001

# 2. 檢查環境變量
cat apps/backend/.env | grep JWT

# 3. 查看後端最新日誌
tail -50 ~/.cursor/projects/Users-danielkai-Desktop-safe-net/terminals/24.txt

# 4. 測試後端 API
curl http://localhost:3001/api/health

# 5. 檢查資料庫連接
docker ps | grep postgres
```

---

## ✅ 成功標誌

當一切正常時，您應該看到：

### App 端
```
✅ 登入成功
✅ 可以看到「我的社區」
✅ 可以看到長輩列表（如果有資料）
✅ 可以看到警報列表（如果有資料）
```

### 後端日誌
```
✅ [JwtAppStrategy] Validating payload
✅ [JwtAppStrategy] User found: { found: true, isActive: true, membershipsCount: X }
✅ SELECT "public"."elders" ... (Prisma 查詢)
```

### 資料流程
```
App 登入 → 獲取 token → 保存到 AsyncStorage
          ↓
App 請求 API → 從 Storage 讀取 token → 添加到 Authorization header
          ↓
後端收到請求 → JWT Strategy 驗證 → 查詢用戶 → 返回數據
          ↓
App 收到數據 → 顯示在畫面上
```

---

## 🆘 需要進一步協助

如果按照以上步驟還是無法解決，請提供：

1. **後端日誌**（最後 100 行）
```bash
tail -100 ~/.cursor/projects/Users-danielkai-Desktop-safe-net/terminals/24.txt > backend-log.txt
```

2. **App 日誌截圖**（包含所有 LOG 和 ERROR）

3. **環境變量內容**
```bash
cat apps/backend/.env
```

4. **後端進程狀態**
```bash
lsof -ti:3001 && echo "後端正在運行" || echo "後端未運行"
```

---

## 💡 預防措施

為了避免將來出現類似問題：

1. **創建 .env.example**
```bash
# apps/backend/.env.example
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=*
JWT_SECRET=your-backend-secret
JWT_APP_SECRET=your-app-secret
```

2. **添加環境變量驗證**
在 `main.ts` 中添加：
```typescript
if (!process.env.JWT_APP_SECRET) {
  console.warn('⚠️  JWT_APP_SECRET not set, using default value');
}
```

3. **定期清除開發環境 token**
每次修改 JWT 配置後，記得清除 App 數據。
