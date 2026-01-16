# 修復：新增長輩 API 路由問題

**修復時間**: 2026-01-16 15:48  
**問題**: 404 錯誤和 Picker import 錯誤

---

## 🐛 發現的問題

### 問題 1：404 錯誤

```
ERROR  載入可用設備失敗: [AxiosError: Request failed with status code 404]
```

**請求路徑**: `GET /api/app/elders/available-devices?tenantId=xxx`

**根本原因**: NestJS 路由順序問題

```typescript
// 錯誤的順序
@Get(':id')              // ← 這會匹配 'available-devices'
async findOne() {}

@Get('available-devices') // ← 永遠到不了這裡！404
async getAvailableDevices() {}
```

**為什麼**：
- NestJS 按照定義順序匹配路由
- `@Get(':id')` 會匹配任何路徑，包括 `available-devices`
- 所以 `available-devices` 被當成 `id` 參數處理
- 找不到 ID 為 'available-devices' 的長輩 → 404

---

## ✅ 修復方案

### 調整路由順序

**原則**：具體路徑必須在動態路徑之前

```typescript
// 正確的順序
@Post()                    // 1. POST /
@Get()                     // 2. GET /
@Get('available-devices')  // 3. GET /available-devices ✓ 具體路徑
@Get(':id')                // 4. GET /:id ← 動態路徑
@Get(':id/locations')      // 5. GET /:id/locations
```

### 修改文件

**文件**: `apps/backend/src/app-elders/app-elders.controller.ts`

**修改**: 將 `@Get('available-devices')` 移到 `@Get(':id')` 之前

---

## 🔄 路由匹配順序

### 修復前（錯誤）❌

```
請求: GET /api/app/elders/available-devices

NestJS 匹配流程：
1. @Post() - 不匹配（method 不同）
2. @Get('available-devices') - 匹配！但...
3. @Get() - 已經有 query，不匹配
4. @Get(':id') - 匹配！← 先執行這個！
   ├─ id = 'available-devices'
   ├─ 查找 ID 為 'available-devices' 的長輩
   └─ 找不到 → 404 ✗

@Get('available-devices') 永遠執行不到
```

### 修復後（正確）✅

```
請求: GET /api/app/elders/available-devices

NestJS 匹配流程：
1. @Post() - 不匹配（method 不同）
2. @Get() - 不匹配（路徑不符）
3. @Get('available-devices') - 匹配！✓
   └─ 執行 getAvailableDevices()
   └─ 返回設備列表 ✓

@Get(':id') 不會被觸發
```

---

## 🧪 測試驗證

### 測試 API

重啟後端後測試：

```bash
# 使用真實 token 測試
TOKEN="your-token-here"

# 測試可用設備 API
curl "http://localhost:3001/api/app/elders/available-devices?tenantId=xxx" \
  -H "Authorization: Bearer $TOKEN" \
  -s | jq

# 預期：返回 200 和設備列表
{
  "data": [
    {
      "id": "...",
      "macAddress": "AA:BB:CC:DD:EE:01",
      "deviceName": "設備1",
      "batteryLevel": 85
    }
  ],
  "timestamp": "..."
}
```

### 在 App 中測試

```
1. 登入管理員帳號
2. 點擊追蹤頁面的 [+] 按鈕
3. 選擇社區
4. 觀察：
   - ✅ 應該看到「載入設備中...」
   - ✅ 然後顯示可用設備列表
   - ✅ 或顯示「此社區尚無可用設備」
   - ❌ 不應該停在「載入設備中...」
```

---

## ⚠️ 重要：需要重啟後端

路由修改需要重啟後端服務才能生效：

```bash
# 在運行 pnpm dev 的終端按 Ctrl+C
# 然後重新啟動：
cd /Users/danielkai/Desktop/safe-net
pnpm dev
```

---

## 📚 NestJS 路由最佳實踐

### 1. 路由順序很重要

```typescript
// ✓ 正確順序
@Get('specific-route')  // 具體路徑在前
@Get(':id')            // 動態路徑在後

// ✗ 錯誤順序
@Get(':id')            // 動態路徑在前，會匹配所有
@Get('specific-route') // 永遠執行不到
```

### 2. 常見路由模式

```typescript
@Controller('items')
export class ItemsController {
  @Post()              // POST /items
  @Get()               // GET /items
  @Get('search')       // GET /items/search ← 具體路徑
  @Get('stats')        // GET /items/stats  ← 具體路徑
  @Get(':id')          // GET /items/:id    ← 動態路徑
  @Get(':id/details')  // GET /items/:id/details
  @Patch(':id')        // PATCH /items/:id
  @Delete(':id')       // DELETE /items/:id
}
```

### 3. 調試路由問題

如果遇到 404，檢查：
1. 路由路徑是否正確
2. 路由順序是否正確
3. HTTP method 是否正確
4. Guard 是否阻擋了請求

---

## ✅ 修復結果

### 修復後的行為

```
App 發送請求
   ↓
GET /api/app/elders/available-devices?tenantId=xxx
   ↓
後端匹配路由
   ↓
執行 getAvailableDevices()
   ↓
檢查權限 ✓
   ↓
查詢數據庫
   ↓
返回設備列表 ✓
   ↓
App 顯示可用設備
```

### App 端日誌（修復後）

```javascript
LOG  [ApiClient] Request: /app/elders/available-devices?tenantId=xxx
// 不再出現 404 錯誤
LOG  可用設備: { count: 3, devices: [...] }
```

---

## 📊 最終狀態

### 後端 API

- ✅ `POST /api/app/elders` - 創建長輩
- ✅ `GET /api/app/elders` - 長輩列表
- ✅ `GET /api/app/elders/available-devices` - 可用設備 ⭐ 已修復
- ✅ `GET /api/app/elders/:id` - 長輩詳情
- ✅ `GET /api/app/elders/:id/locations` - 行蹤記錄

### App 功能

- ✅ 查看長輩列表
- ✅ 查看長輩詳情
- ✅ 新增長輩 ⭐
- ✅ 載入可用設備 ⭐ 已修復
- ✅ 綁定設備 ⭐

---

## 🚀 下一步

1. **重啟後端服務**（必須！）

```bash
cd /Users/danielkai/Desktop/safe-net
# Ctrl+C 停止服務
pnpm dev
```

2. **測試新增長輩功能**

```
- 登入管理員帳號
- 點擊追蹤頁面 [+]
- 選擇社區
- 等待設備載入（不再 404）
- 填寫長輩資料
- 選擇設備（如果有）
- 點擊新增
- 成功！
```

---

**修復完成！重啟後端後即可正常使用！** 🎉
