# 🚀 重啟後端服務

## ⚠️ 重要：必須完全重啟

`.env` 文件的變更**不會**被熱重載！必須完全停止後重新啟動。

---

## 📋 執行步驟

### 1. 確認所有進程已停止
```bash
# 檢查
lsof -ti:3001 && echo "❌ 還在運行" || echo "✅ 已停止"

# 如果還在運行，強制停止
lsof -ti:3001 | xargs kill -9
```

### 2. 重新啟動服務
```bash
cd /Users/danielkai/Desktop/safe-net
pnpm dev
```

### 3. 等待完全啟動
看到以下訊息才算成功：
```
✓ Built in XXXms
[Nest] Application successfully started
```

### 4. 驗證環境變量已載入
啟動後，在**新終端**運行：
```bash
# 測試註冊（會生成新 token）
curl -X POST http://localhost:3001/api/app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "verify-'$(date +%s)'@test.com",
    "password": "password123"
  }' | jq '.'

# 應該看到：
# {
#   "data": {
#     "data": {
#       "access_token": "eyJ...",
#       "user": { ... }
#     }
#   }
# }
```

### 5. 測試新 Token 是否有效
```bash
# 獲取 token 並測試
TOKEN=$(curl -s -X POST http://localhost:3001/api/app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"T","email":"t'$(date +%s)'@t.com","password":"p"}' \
  | jq -r '.data.data.access_token')

echo "Token: ${TOKEN:0:50}..."

# 用 token 訪問社區列表
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/app/tenants | jq '.data | length'

# 應該返回數字（社區數量），不是 401 錯誤
```

### 6. 查看後端日誌
```bash
# 在啟動後端的終端，應該能看到：
# [JwtAppStrategy] Validating payload: { sub: 'xxx', email: 'xxx@test.com', exp: ... }
# [JwtAppStrategy] User found: { found: true, isActive: true, membershipsCount: 0 }
```

---

## 🔍 成功標誌

### 後端日誌應該顯示
```
✅ [Nest] Application successfully started
✅ [JwtAppStrategy] Validating payload  ← 新增的調試日誌
✅ [JwtAppStrategy] User found
```

### API 測試應該返回
```
✅ 註冊成功，返回 token
✅ 用新 token 可以訪問 /app/tenants
✅ 返回社區列表，不是 401
```

---

## ❌ 如果還是失敗

### 檢查點 1：環境變量
```bash
cat apps/backend/.env | grep JWT_APP_SECRET
# 應該看到：JWT_APP_SECRET=app-secret-key-change-in-production
```

### 檢查點 2：後端日誌
如果看不到 `[JwtAppStrategy]` 日誌，說明：
- 代碼沒有被編譯
- 或者緩存問題

解決：
```bash
# 清除緩存並重新構建
cd /Users/danielkai/Desktop/safe-net
rm -rf apps/backend/dist apps/backend/.turbo
pnpm dev
```

### 檢查點 3：Token 格式
```bash
# 檢查 token payload
TOKEN="eyJ..."  # 從註冊獲得的 token
echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq '.'
# 應該看到：{ "sub": "user-id", "email": "...", "iat": ..., "exp": ... }
```

---

## 🎯 App 端測試

### 重新安裝或清除數據
```bash
# 選項 A：清除數據（Android）
adb shell pm clear com.safenet.app

# 選項 B：重新安裝
cd apps/mobile
npx expo run:android --device
```

### 登入後應該看到
```
✅ [Storage] Token saved successfully
✅ [ApiClient] Request interceptor: {"hasToken": true, ...}
✅ 可以看到社區列表（或空列表，但不是 401）
✅ 可以看到個人資料
```

---

## 💡 理解問題

### 為什麼需要完全重啟？

```
.env 文件變更 → 只存在於文件系統
                ↓
需要進程重新讀取 → process.env 才會更新
                ↓
熱重載只更新代碼 → 不會重新讀取 .env
                ↓
必須重啟進程 → 才能載入新的環境變量
```

### Token 驗證流程

```
1. 登入/註冊 → 生成 Token
   Token = sign(payload, SECRET)
   
2. 訪問 API → 驗證 Token
   verify(token, SECRET)
   
3. SECRET 必須一致
   生成時的 SECRET === 驗證時的 SECRET
```

### 當前狀況

```
舊狀況（失敗）：
- 生成 Token：使用默認 SECRET（沒有從 .env 讀取）
- 驗證 Token：也使用默認 SECRET
- 但是 Token 無法解析 → 驗證失敗

新狀況（修復後）：
- .env 已更新：JWT_APP_SECRET=app-secret-key-change-in-production
- 重啟後端：process.env.JWT_APP_SECRET 被載入
- 生成 Token：使用 .env 中的 SECRET
- 驗證 Token：使用相同的 SECRET → 成功
```

---

## 📞 還需要協助？

如果按照以上步驟還是失敗，請提供：

1. **後端啟動日誌**（完整輸出）
2. **測試命令的輸出**（註冊和驗證 token）
3. **App 端日誌**（登入後的所有 LOG）

這樣可以更準確地診斷問題。
