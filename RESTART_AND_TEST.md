# 重啟服務並測試修復

## ⚠️ 重要：需要重啟後端服務

修改的 Guard 文件需要重啟服務才能生效（熱重載無效）。

---

## 🔄 步驟 1：重啟後端服務

### 方式 A：在終端手動重啟

1. 在運行 `pnpm dev` 的終端按 `Ctrl+C` 停止服務
2. 再次執行：
   ```bash
   cd /Users/danielkai/Desktop/safe-net
   pnpm dev
   ```

### 方式 B：使用命令重啟

```bash
# 找到並停止進程
pkill -f "pnpm dev"

# 等待 2 秒
sleep 2

# 重新啟動
cd /Users/danielkai/Desktop/safe-net && pnpm dev
```

---

## ✅ 步驟 2：測試修復

### 測試腳本

重啟服務後，在**新終端**執行以下命令：

```bash
cd /Users/danielkai/Desktop/safe-net

# 1. 註冊測試用戶
echo "=== 測試 1: 註冊用戶 ==="
TOKEN=$(curl -X POST http://localhost:3001/api/app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@example.com","name":"測試用戶2","password":"password123","phone":"0912345678"}' \
  -s | jq -r '.data.data.access_token')

echo "Token 獲取成功: ${TOKEN:0:50}..."
echo ""

# 2. 測試長輩清單 API
echo "=== 測試 2: 長輩清單 API ==="
curl http://localhost:3001/api/app/elders \
  -H "Authorization: Bearer $TOKEN" \
  -s | jq
echo ""

# 3. 測試警報清單 API
echo "=== 測試 3: 警報清單 API ==="
curl http://localhost:3001/api/app/alerts \
  -H "Authorization: Bearer $TOKEN" \
  -s | jq
echo ""

# 4. 測試社區清單 API
echo "=== 測試 4: 社區清單 API ==="
curl http://localhost:3001/api/app/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -s | jq
echo ""

# 5. 測試個人資料 API
echo "=== 測試 5: 個人資料 API ==="
curl http://localhost:3001/api/app/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  -s | jq
echo ""

echo "✅ 如果以上所有測試都返回 200 而不是 401，則修復成功！"
```

### 預期結果

**成功的響應**：

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "totalPages": 0
  },
  "timestamp": "2026-01-16T..."
}
```

**失敗的響應（如果還是 401）**：

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "timestamp": "2026-01-16T..."
}
```

---

## 🔍 步驟 3：檢查後端日誌

重啟後，後端日誌應該顯示：

```
[JwtAuthGuard] Skipping App route: /api/app/elders
[JwtAppStrategy] Validating payload: { sub: '...', email: '...' }
[JwtAppStrategy] User found: { found: true, isActive: true, ... }
```

如果看到這些日誌，說明修復正常運作！

---

## 📱 步驟 4：測試 Mobile App

1. **清除 App 數據**（重要！）：
   ```bash
   adb shell pm clear com.safenet.app
   ```

2. **重新運行 App**：
   ```bash
   cd /Users/danielkai/Desktop/safe-net/apps/mobile
   npx expo run:android --device
   ```

3. **測試流程**：
   - 註冊新帳號或登入
   - 查看「追蹤」頁面 → 應該顯示空白狀態（尚無長輩資料）
   - 查看「警報」頁面 → 應該顯示空白狀態（暫無警報）
   - 查看「個人」頁面 → 應該顯示用戶資料
   - 點擊「加入社區」→ 應該看到社區清單

4. **如果一切正常**：
   - 不再看到 401 錯誤
   - 可以正常瀏覽各個頁面
   - 空白頁面有提示文字而不是錯誤訊息

---

## 🐛 如果還是失敗

### 檢查清單

1. **確認後端已重啟**
   ```bash
   ps aux | grep "pnpm dev"
   ```

2. **確認修改已生效**
   ```bash
   cat /Users/danielkai/Desktop/safe-net/apps/backend/src/auth/guards/jwt-auth.guard.ts | grep "startsWith"
   ```
   應該看到：`if (request.url?.startsWith('/api/app/'))`

3. **檢查環境變數**
   ```bash
   cd /Users/danielkai/Desktop/safe-net/apps/backend
   grep JWT .env
   ```
   應該看到兩個不同的 secret

4. **查看完整錯誤日誌**
   在後端終端查看完整的錯誤堆疊

---

## 📚 相關文檔

- `APP_TOKEN_FIX.md` - 問題詳細分析和修復說明
- `MOBILE_APP_API_REFERENCE.md` - App API 參考
- `SYSTEM_ARCHITECTURE_CLARIFICATION.md` - 系統架構說明

---

**需要幫助？** 查看 `APP_TOKEN_FIX.md` 了解問題的完整分析。
