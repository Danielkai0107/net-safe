# Safe-Net API 完整參考文檔

**版本**: 1.0.0  
**Base URL**: `http://localhost:3001/api`  
**認證方式**: JWT Bearer Token  
**完成狀態**: ✅ **100% 完成**

---

## 📚 目錄

1. [認證 (Auth)](#認證-auth)
2. [社區管理 (Tenants)](#社區管理-tenants)
3. [長者管理 (Elders)](#長者管理-elders)
4. [設備管理 (Devices)](#設備管理-devices)
5. [接收點管理 (Gateways)](#接收點管理-gateways)
6. [訊號記錄 (Logs)](#訊號記錄-logs)
7. [警報管理 (Alerts)](#警報管理-alerts)
8. [儀表板 (Dashboard)](#儀表板-dashboard)
9. [測試範例](#測試範例)

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

**權限**: Super Admin only

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
  "settings": {
    "inactiveAlertHours": 24,
    "boundaryAlertEnabled": true
  },
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

**權限**: Super Admin only

---

## 長者管理 (Elders)

### 列表（可過濾）
```http
GET /api/elders?page=1&limit=10&tenantId=xxx
Authorization: Bearer <access_token>
```

**Query Parameters**:
- `page`: 頁碼（預設 1）
- `limit`: 每頁數量（預設 10）
- `tenantId`: 過濾特定社區（可選）

**Response**:
```json
{
  "data": {
    "data": [
      {
        "id": "elder-id",
        "name": "陳阿公",
        "phone": "0912-555-666",
        "address": "大愛社區 A 棟 3 樓",
        "emergencyContact": "陳小明（兒子）",
        "emergencyPhone": "0912-777-888",
        "status": "ACTIVE",
        "lastActivityAt": "2026-01-15T10:30:00.000Z",
        "device": {
          "macAddress": "AA:BB:CC:DD:EE:01",
          "batteryLevel": 85
        },
        "tenant": {
          "id": "tenant-id",
          "name": "大愛社區"
        }
      }
    ],
    "meta": {
      "total": 2,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

### 新增長者
```http
POST /api/elders
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "tenantId": "tenant-id",
  "name": "王阿嬤",
  "phone": "0912-123-456",
  "address": "社區 C 棟 1 樓",
  "emergencyContact": "王小明",
  "emergencyPhone": "0912-789-012",
  "notes": "需要特別關注",
  "status": "ACTIVE",
  "inactiveThresholdHours": 24
}
```

**權限**: Super Admin, Tenant Admin

### 取得詳情
```http
GET /api/elders/:id
Authorization: Bearer <access_token>
```

### 取得活動記錄
```http
GET /api/elders/:id/activity?hours=24
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "data": {
    "elder": { ... },
    "activity": {
      "hours": 24,
      "count": 15,
      "logs": [
        {
          "timestamp": "2026-01-15T14:30:00.000Z",
          "rssi": -65,
          "distance": 2.5,
          "gateway": {
            "name": "社區大門",
            "location": "正門入口"
          }
        }
      ]
    }
  }
}
```

### 取得行蹤記錄
```http
GET /api/elders/:id/location?limit=50
Authorization: Bearer <access_token>
```

### 更新長者
```http
PATCH /api/elders/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "phone": "0912-999-888",
  "status": "HOSPITALIZED"
}
```

### 刪除長者
```http
DELETE /api/elders/:id
Authorization: Bearer <access_token>
```

**權限**: Super Admin only

---

## 設備管理 (Devices)

### 列表（分頁）
```http
GET /api/devices?page=1&limit=10
Authorization: Bearer <access_token>
```

### 新增設備
```http
POST /api/devices
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "elderId": "elder-id",
  "macAddress": "AA:BB:CC:DD:EE:03",
  "uuid": "FDA50693-A4E2-4FB1-AFCF-C6EB07647825",
  "major": 100,
  "minor": 3,
  "deviceName": "測試手環",
  "type": "IBEACON",
  "batteryLevel": 100
}
```

**權限**: Super Admin, Tenant Admin

**注意**: 
- MAC Address 必須唯一
- 每位長者只能有一個設備

### 根據 MAC Address 查詢
```http
GET /api/devices/mac/:macAddress
Authorization: Bearer <access_token>
```

**範例**:
```bash
GET /api/devices/mac/AA:BB:CC:DD:EE:01
```

### 取得詳情
```http
GET /api/devices/:id
Authorization: Bearer <access_token>
```

### 更新設備（含電量）
```http
PATCH /api/devices/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "batteryLevel": 75,
  "deviceName": "新名稱"
}
```

### 刪除設備
```http
DELETE /api/devices/:id
Authorization: Bearer <access_token>
```

**權限**: Super Admin only

---

## 接收點管理 (Gateways)

### 列表（可過濾）
```http
GET /api/gateways?page=1&limit=10&tenantId=xxx&type=BOUNDARY
Authorization: Bearer <access_token>
```

**Query Parameters**:
- `tenantId`: 過濾特定社區
- `type`: 過濾類型（GENERAL/BOUNDARY/MOBILE）

### 新增接收點
```http
POST /api/gateways
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "tenantId": "tenant-id",
  "serialNumber": "GW-TEST-001",
  "name": "測試接收點",
  "location": "社區側門",
  "type": "BOUNDARY",
  "latitude": 25.033,
  "longitude": 121.5654
}
```

**固定式 Gateway**:
```json
{
  "serialNumber": "GW-{社區代碼}-{編號}",
  "type": "GENERAL" 或 "BOUNDARY",
  "latitude": 25.033,
  "longitude": 121.5654
}
```

**移動式 Gateway**（志工手機）:
```json
{
  "serialNumber": "MOBILE-IPHONE-A3K9F2",
  "type": "MOBILE",
  "deviceInfo": {
    "brand": "Apple",
    "model": "iPhone 15",
    "osVersion": "iOS 17.2",
    "appVersion": "1.0.0"
  }
}
```

### 取得詳情
```http
GET /api/gateways/:id
Authorization: Bearer <access_token>
```

### 更新接收點
```http
PATCH /api/gateways/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "新名稱",
  "type": "BOUNDARY",
  "isActive": true
}
```

### 刪除接收點
```http
DELETE /api/gateways/:id
Authorization: Bearer <access_token>
```

**權限**: Super Admin only

---

## 訊號記錄 (Logs)

### 🔥 Gateway 上傳訊號（Public API）

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
  "altitude": 50.0,
  "accuracy": 10.0,
  "timestamp": "2026-01-15T14:30:00.000Z"
}
```

**必填欄位**:
- `gatewaySerialNumber`: Gateway 序列號
- `macAddress`: Beacon MAC Address
- `rssi`: 訊號強度（dBm）

**選填欄位**:
- `distance`: 估算距離（米）
- `proximity`: 接近程度（IMMEDIATE/NEAR/FAR/UNKNOWN）
- `uuid`, `major`, `minor`: iBeacon 參數
- `latitude`, `longitude`: GPS 座標（移動式 Gateway）
- `timestamp`: 時間戳記（預設為當前時間）

**自動處理流程**:
1. ✅ 驗證 Gateway 存在且啟用
2. ✅ 驗證 Device 存在且啟用
3. ✅ 建立訊號記錄 (Log)
4. ✅ 更新設備最後出現時間
5. ✅ 更新長者最後活動時間
6. ✅ 建立行蹤記錄（如有 GPS）
7. ✅ 自動檢查並觸發警報：
   - **邊界點警報**（Gateway type = BOUNDARY）
   - **當日首次活動通知**
   - **低電量警報**（電量 < 20%）

**Response**:
```json
{
  "data": {
    "status": "success",
    "logId": "log-id",
    "elderName": "陳阿公",
    "gatewayName": "社區大門"
  }
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

## 警報管理 (Alerts)

### 列表（可過濾）
```http
GET /api/alerts?page=1&limit=10&tenantId=xxx&elderId=yyy&type=BOUNDARY&status=PENDING
Authorization: Bearer <access_token>
```

**Query Parameters**:
- `tenantId`: 過濾社區
- `elderId`: 過濾長者
- `type`: 警報類型（BOUNDARY/INACTIVE/FIRST_ACTIVITY/LOW_BATTERY）
- `status`: 警報狀態（PENDING/NOTIFIED/RESOLVED/DISMISSED）

### 警報統計
```http
GET /api/alerts/stats?tenantId=xxx
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "data": {
    "total": 10,
    "pending": 3,
    "resolved": 7,
    "byType": [
      {"type": "BOUNDARY", "_count": 5},
      {"type": "FIRST_ACTIVITY", "_count": 3}
    ],
    "bySeverity": [
      {"severity": "HIGH", "_count": 2},
      {"severity": "MEDIUM", "_count": 8}
    ]
  }
}
```

### 取得詳情
```http
GET /api/alerts/:id
Authorization: Bearer <access_token>
```

### 解決警報
```http
PATCH /api/alerts/:id/resolve
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "resolvedBy": "user-id",
  "resolution": "已確認長者平安，已聯繫家屬"
}
```

**權限**: All roles

### 忽略警報
```http
PATCH /api/alerts/:id/dismiss
Authorization: Bearer <access_token>
```

自動使用當前用戶 ID 和預設處理說明。

### 刪除警報
```http
DELETE /api/alerts/:id
Authorization: Bearer <access_token>
```

**權限**: Super Admin only

---

## 儀表板 (Dashboard)

### 總覽統計
```http
GET /api/dashboard/overview
Authorization: Bearer <access_token>
```

**權限**: Super Admin only

**Response**:
```json
{
  "data": {
    "tenants": {"total": 1},
    "elders": {"total": 2, "active": 2},
    "devices": {"total": 2},
    "gateways": {"total": 3},
    "alerts": {"pending": 1, "today": 1},
    "logs": {"today": 3}
  }
}
```

### 社區統計
```http
GET /api/dashboard/tenant/:id
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "data": {
    "tenant": { ... },
    "stats": {
      "elders": {
        "total": 2,
        "active": 2,
        "byStatus": [
          {"status": "ACTIVE", "_count": 2}
        ]
      },
      "devices": {"total": 2},
      "gateways": {
        "total": 3,
        "byType": [
          {"type": "GENERAL", "_count": 1},
          {"type": "BOUNDARY", "_count": 1},
          {"type": "MOBILE", "_count": 1}
        ]
      },
      "alerts": {"pending": 1, "today": 1},
      "logs": {"today": 3}
    }
  }
}
```

### 活動趨勢
```http
GET /api/dashboard/activity?tenantId=xxx&days=7
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "data": [
    {"date": "2026-01-09", "count": 120},
    {"date": "2026-01-10", "count": 135},
    {"date": "2026-01-11", "count": 128},
    {"date": "2026-01-12", "count": 142},
    {"date": "2026-01-13", "count": 156},
    {"date": "2026-01-14", "count": 149},
    {"date": "2026-01-15", "count": 87}
  ]
}
```

### 警報摘要
```http
GET /api/dashboard/alerts-summary?tenantId=xxx
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "data": {
    "recentAlerts": [ ... ],
    "byType": [
      {"type": "BOUNDARY", "_count": 5},
      {"type": "FIRST_ACTIVITY", "_count": 8}
    ],
    "bySeverity": [
      {"severity": "HIGH", "_count": 3}
    ],
    "byStatus": [
      {"status": "PENDING", "_count": 1}
    ]
  }
}
```

---

## 測試範例

### 完整測試流程

#### 1. 登入取得 Token
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@safenet.com","password":"admin123456"}'
```

儲存返回的 `access_token`。

#### 2. 查詢長者列表
```bash
TOKEN="your-access-token"

curl "http://localhost:3001/api/elders?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

#### 3. 新增長者
```bash
curl -X POST http://localhost:3001/api/elders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "cmkfjo8l20001or4099jy7hwj",
    "name": "新增長者",
    "phone": "0912-111-222",
    "address": "測試地址"
  }'
```

#### 4. 新增 Beacon 設備
```bash
curl -X POST http://localhost:3001/api/devices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "elderId": "elder-id-from-step3",
    "macAddress": "AA:BB:CC:DD:EE:99",
    "uuid": "FDA50693-A4E2-4FB1-AFCF-C6EB07647825",
    "major": 100,
    "minor": 99,
    "deviceName": "測試 Beacon",
    "type": "IBEACON",
    "batteryLevel": 100
  }'
```

#### 5. Gateway 上傳訊號（無需認證）
```bash
curl -X POST http://localhost:3001/api/logs/upload \
  -H "Content-Type: application/json" \
  -d '{
    "gatewaySerialNumber": "GW-DALOVE-001",
    "macAddress": "AA:BB:CC:DD:EE:99",
    "rssi": -70,
    "distance": 3.2,
    "proximity": "NEAR"
  }'
```

#### 6. 查看長者活動記錄
```bash
curl "http://localhost:3001/api/elders/elder-id/activity?hours=24" \
  -H "Authorization: Bearer $TOKEN"
```

#### 7. 查看警報
```bash
curl "http://localhost:3001/api/alerts?status=PENDING" \
  -H "Authorization: Bearer $TOKEN"
```

#### 8. 查看儀表板統計
```bash
curl "http://localhost:3001/api/dashboard/overview" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔐 權限控制矩陣

| API 端點 | Super Admin | Tenant Admin | Staff | Public |
|---------|-------------|--------------|-------|--------|
| Auth (Login, Profile) | ✅ | ✅ | ✅ | ✅ |
| Tenants (Read) | ✅ | ✅ (Own) | ✅ (Own) | ❌ |
| Tenants (Write) | ✅ | ❌ | ❌ | ❌ |
| Elders (Read) | ✅ | ✅ (Own Tenant) | ✅ (Own Tenant) | ❌ |
| Elders (Write) | ✅ | ✅ (Own Tenant) | ❌ | ❌ |
| Devices (Read) | ✅ | ✅ (Own Tenant) | ✅ (Own Tenant) | ❌ |
| Devices (Write) | ✅ | ✅ (Own Tenant) | ❌ | ❌ |
| Gateways (Read) | ✅ | ✅ (Own Tenant) | ✅ (Own Tenant) | ❌ |
| Gateways (Write) | ✅ | ✅ (Own Tenant) | ❌ | ❌ |
| Logs (Upload) | - | - | - | ✅ |
| Logs (Read) | ✅ | ✅ (Own Tenant) | ✅ (Own Tenant) | ❌ |
| Alerts (Read) | ✅ | ✅ (Own Tenant) | ✅ (Own Tenant) | ❌ |
| Alerts (Resolve/Dismiss) | ✅ | ✅ | ✅ | ❌ |
| Alerts (Delete) | ✅ | ❌ | ❌ | ❌ |
| Dashboard | ✅ | ✅ (Own Tenant) | ✅ (Own Tenant) | ❌ |

---

## 📝 資料模型

### Elder (長者)
```typescript
{
  id: string
  tenantId: string
  name: string
  phone?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  photo?: string
  notes?: string
  status: 'ACTIVE' | 'INACTIVE' | 'HOSPITALIZED' | 'DECEASED' | 'MOVED_OUT'
  inactiveThresholdHours: number (預設 24)
  lastActivityAt?: DateTime
  lastSeenLocation?: Json
  isActive: boolean
}
```

### Device (設備)
```typescript
{
  id: string
  elderId: string (unique)
  macAddress: string (unique)
  uuid?: string
  major?: number
  minor?: number
  deviceName?: string
  type: 'IBEACON' | 'EDDYSTONE' | 'GENERIC_BLE'
  batteryLevel?: number (0-100)
  lastSeen?: DateTime
  lastRssi?: number
  lastGatewayId?: string
  isActive: boolean
}
```

### Gateway (接收點)
```typescript
{
  id: string
  tenantId: string
  serialNumber: string (unique)
  name: string
  location?: string
  type: 'GENERAL' | 'BOUNDARY' | 'MOBILE'
  latitude?: number
  longitude?: number
  deviceInfo?: Json
  isActive: boolean
}
```

### Alert (警報)
```typescript
{
  id: string
  tenantId: string
  elderId: string
  gatewayId?: string
  type: 'BOUNDARY' | 'INACTIVE' | 'FIRST_ACTIVITY' | 'LOW_BATTERY' | 'EMERGENCY'
  status: 'PENDING' | 'NOTIFIED' | 'RESOLVED' | 'DISMISSED'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  message: string
  details?: Json
  latitude?: number
  longitude?: number
  triggeredAt: DateTime
  resolvedAt?: DateTime
  resolvedBy?: string
  resolution?: string
}
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

**常見狀態碼**:
- `200`: 成功
- `201`: 建立成功
- `400`: 請求錯誤（驗證失敗）
- `401`: 未認證
- `403`: 權限不足
- `404`: 資源不存在
- `409`: 衝突（如重複的 MAC Address）
- `500`: 服務器錯誤

---

## 🔑 測試帳號

| 角色 | Email | 密碼 | tenantId |
|------|-------|------|----------|
| Super Admin | admin@safenet.com | admin123456 | null |
| 社區管理員 | admin@dalove.com | admin123 | DALOVE001 |
| 一般人員 | staff@dalove.com | staff123 | DALOVE001 |

---

## 📊 API 端點總覽

**總計**: **39 個端點** ✅ 100% 完成

| 模組 | 端點數 | 狀態 |
|------|--------|------|
| Auth | 3 | ✅ |
| Tenants | 6 | ✅ |
| Elders | 7 | ✅ |
| Devices | 6 | ✅ |
| Gateways | 5 | ✅ |
| Logs | 2 | ✅ |
| Alerts | 6 | ✅ |
| Dashboard | 4 | ✅ |

---

## 📚 相關文檔

- [資料庫架構](packages/database/DATABASE_SCHEMA.md)
- [API 開發狀態](API_DEVELOPMENT_STATUS.md)
- [完整 API 總結](FINAL_API_SUMMARY.md)
- [App PRD](App%20PRD.pdf)
- [後台 PRD](後台PRD.pdf)

---

**建立時間**: 2026-01-15  
**維護團隊**: Safe-Net Development Team  
**狀態**: ✅ 生產就緒
