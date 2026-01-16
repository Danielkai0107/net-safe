# Safe-Net API 文檔

**版本**: 1.0.0  
**Base URL**: `http://localhost:3001/api`  
**認證方式**: JWT Bearer Token

---

## 📖 目錄

1. [認證 (Auth)](#認證-auth)
2. [社區管理 (Tenants)](#社區管理-tenants)
3. [訊號記錄 (Logs)](#訊號記錄-logs) - **最重要的 Gateway 上傳端點**
4. [待實作模組](#待實作模組)

---

## 認證 (Auth)

### 登入
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@safenet.com",
  "password": "admin123456"
}
```

**Response**:
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-id",
      "email": "admin@safenet.com",
      "name": "系統管理員",
      "role": "SUPER_ADMIN",
      "tenantId": null
    }
  },
  "timestamp": "2026-01-15T14:30:00.000Z"
}
```

### 取得個人資料
```http
GET /api/auth/profile
Authorization: Bearer <access_token>
```

### 取得當前用戶
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

---

## 社區管理 (Tenants)

### 列表（分頁）
```http
GET /api/tenants?page=1&limit=10
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "data": {
    "data": [
      {
        "id": "tenant-id",
        "code": "DALOVE001",
        "name": "大愛社區",
        "address": "台北市信義區...",
        "isActive": true,
        "_count": {
          "elders": 2,
          "gateways": 3,
          "users": 3
        }
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

### 新增社區
```http
POST /api/tenants
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "code": "TEST001",
  "name": "測試社區",
  "address": "台北市...",
  "contactPerson": "王經理",
  "contactPhone": "02-1234-5678",
  "lineNotifyToken": "your-line-token",
  "isActive": true
}
```

### 取得詳情
```http
GET /api/tenants/:id
Authorization: Bearer <access_token>
```

### 取得統計資料
```http
GET /api/tenants/:id/stats
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "data": {
    "tenant": { ... },
    "stats": {
      "totalElders": 2,
      "activeElders": 2,
      "totalDevices": 2,
      "totalGateways": 3,
      "pendingAlerts": 0,
      "todayLogs": 5
    }
  }
}
```

### 更新社區
```http
PATCH /api/tenants/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "新名稱",
  "isActive": false
}
```

### 刪除社區
```http
DELETE /api/tenants/:id
Authorization: Bearer <access_token>
```

---

## 訊號記錄 (Logs)

### 🔥 Gateway 上傳訊號（Public API - 最重要）

**這是系統的核心端點，Gateway 硬體會調用此 API 上傳偵測到的 Beacon 訊號。**

```http
POST /api/logs/upload
Content-Type: application/json

{
  "gatewaySerialNumber": "GW-DALOVE-001",
  "macAddress": "AA:BB:CC:DD:EE:01",
  "rssi": -65,
  "distance": 2.5,
  "proximity": "NEAR",
  "uuid": "FDA50693-A4E2-4FB1-AFCF-C6EB07647825",
  "major": 100,
  "minor": 1,
  "latitude": 25.033,
  "longitude": 121.5654,
  "accuracy": 10,
  "timestamp": "2026-01-15T14:30:00.000Z"
}
```

**Response**:
```json
{
  "data": {
    "status": "success",
    "logId": "log-id",
    "elderName": "陳阿公",
    "gatewayName": "社區大門"
  },
  "timestamp": "2026-01-15T14:30:00.000Z"
}
```

**功能說明**:
1. ✅ 驗證 Gateway 和 Device 存在
2. ✅ 建立訊號記錄
3. ✅ 更新設備最後出現時間
4. ✅ 更新長者最後活動時間
5. ✅ 建立行蹤記錄（如果有 GPS）
6. ✅ 自動檢查並觸發警報：
   - 邊界點警報（Gateway type = BOUNDARY）
   - 當日首次活動通知
   - 低電量警報（電量 < 20%）

**錯誤響應**:
```json
{
  "statusCode": 404,
  "message": "Gateway GW-DALOVE-999 not found",
  "timestamp": "2026-01-15T14:30:00.000Z"
}
```

### 查詢訊號記錄
```http
GET /api/logs?deviceId=xxx&gatewayId=yyy&startDate=2026-01-01&endDate=2026-01-15&page=1&limit=50
Authorization: Bearer <access_token>
```

**Query Parameters**:
- `deviceId`: 設備 ID（可選）
- `gatewayId`: 接收點 ID（可選）
- `startDate`: 開始日期（可選）
- `endDate`: 結束日期（可選）
- `page`: 頁碼（預設 1）
- `limit`: 每頁數量（預設 50）

---

## 待實作模組

以下模組已有資料庫 Schema，需要按照相同模式實作 CRUD API：

### 1. Elder API（長者管理）
```
GET    /api/elders              # 列表（可依 tenantId 過濾）
POST   /api/elders              # 新增長者
GET    /api/elders/:id          # 詳情
GET    /api/elders/:id/activity # 活動記錄（最近 24 小時）
GET    /api/elders/:id/location # 行蹤記錄
PATCH  /api/elders/:id          # 更新
DELETE /api/elders/:id          # 刪除
```

### 2. Device API（設備管理）
```
GET    /api/devices             # 列表
POST   /api/devices             # 新增設備
GET    /api/devices/:id         # 詳情
GET    /api/devices/mac/:mac    # 根據 MAC Address 查詢
PATCH  /api/devices/:id         # 更新
DELETE /api/devices/:id         # 刪除
```

### 3. Gateway API（接收點管理）
```
GET    /api/gateways            # 列表
POST   /api/gateways            # 新增接收點
GET    /api/gateways/:id        # 詳情
PATCH  /api/gateways/:id        # 更新
DELETE /api/gateways/:id        # 刪除
```

### 4. Alert API（警報管理）
```
GET    /api/alerts              # 列表（可依 tenantId, elderId 過濾）
GET    /api/alerts/:id          # 詳情
PATCH  /api/alerts/:id/resolve  # 解決警報
PATCH  /api/alerts/:id/dismiss  # 忽略警報
DELETE /api/alerts/:id          # 刪除
```

### 5. Dashboard API（統計數據）
```
GET    /api/dashboard/overview       # 總覽統計
GET    /api/dashboard/tenant/:id     # 社區統計
GET    /api/dashboard/activity       # 活動趨勢
GET    /api/dashboard/alerts-summary # 警報摘要
```

---

## 📝 實作指南

### 模組建立步驟

1. **建立目錄結構**:
   ```bash
   mkdir -p src/elders/dto
   ```

2. **建立 DTOs**:
   - `create-elder.dto.ts`
   - `update-elder.dto.ts`

3. **建立 Service** (`elders.service.ts`):
   - 參考 `tenants.service.ts` 的結構
   - 實作 CRUD 方法
   - 注入 `DatabaseService`

4. **建立 Controller** (`elders.controller.ts`):
   - 參考 `tenants.controller.ts` 的結構
   - 添加 Guards 和 Roles 裝飾器
   - 實作路由處理器

5. **建立 Module** (`elders.module.ts`):
   - 匯入 `DatabaseModule`
   - 註冊 Controller 和 Service

6. **更新 AppModule**:
   ```typescript
   import { EldersModule } from './elders/elders.module';
   
   @Module({
     imports: [
       // ...
       EldersModule,
     ],
   })
   ```

---

## 🔐 權限控制

### 角色定義
- `SUPER_ADMIN`: 超級管理員（跨社區管理）
- `TENANT_ADMIN`: 社區管理員（只能管理自己的社區）
- `STAFF`: 一般人員（只能查看）

### 使用方式
```typescript
@Roles(UserRole.SUPER_ADMIN)
@Post()
create(@Body() createDto: CreateDto) {
  // 只有 Super Admin 可以訪問
}

@Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
@Patch(':id')
update(@Param('id') id: string, @Body() updateDto: UpdateDto) {
  // Super Admin 和 Tenant Admin 都可以訪問
}
```

---

## 🧪 測試

### 使用 Seed 資料測試

1. **啟動資料庫**:
   ```bash
   docker compose up -d
   ```

2. **初始化測試資料**:
   ```bash
   pnpm db:seed
   ```

3. **啟動 API Server**:
   ```bash
   pnpm dev
   ```

4. **測試登入**:
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@safenet.com","password":"admin123456"}'
   ```

5. **測試 Gateway 上傳**:
   ```bash
   curl -X POST http://localhost:3001/api/logs/upload \
     -H "Content-Type: application/json" \
     -d '{
       "gatewaySerialNumber": "GW-DALOVE-001",
       "macAddress": "AA:BB:CC:DD:EE:01",
       "rssi": -65,
       "distance": 2.5,
       "proximity": "NEAR"
     }'
   ```

---

## 🐛 錯誤處理

所有錯誤都會返回統一格式：

```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "errors": null,
  "timestamp": "2026-01-15T14:30:00.000Z"
}
```

常見狀態碼：
- `200`: 成功
- `201`: 建立成功
- `400`: 請求錯誤
- `401`: 未認證
- `403`: 權限不足
- `404`: 資源不存在
- `409`: 衝突（如重複的 code）
- `500`: 服務器錯誤

---

## 📚 相關文檔

- [資料庫架構](../../packages/database/DATABASE_SCHEMA.md)
- [App PRD](../../App%20PRD.pdf)
- [後台 PRD](../../後台PRD.pdf)
- [API 實作摘要](./API_IMPLEMENTATION_SUMMARY.md)

---

**建立時間**: 2026-01-15  
**維護團隊**: Safe-Net Development Team
