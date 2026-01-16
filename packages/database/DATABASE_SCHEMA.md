# Safe-Net 資料庫架構設計

## 📊 實體關聯圖 (ERD)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Safe-Net Database                          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Tenant     │ ◄──────────────────┐
│  (社區)      │                    │
├──────────────┤                    │
│ id           │                    │
│ code         │ ◄──┐               │
│ name         │    │               │
│ lineNotify   │    │               │
└──────┬───────┘    │               │
       │            │               │
       │ 1:N        │ 1:N           │
       │            │               │
┌──────▼───────┐    │         ┌─────┴─────┐
│    Elder     │    │         │  Gateway  │
│   (長者)     │    │         │ (接收點)  │
├──────────────┤    │         ├───────────┤
│ id           │    │         │ id        │
│ name         │    │         │ serialNo  │
│ emergencyCtx │    │         │ type      │
│ lastActivity │    │         │ location  │
└──────┬───────┘    │         └─────┬─────┘
       │            │               │
       │ 1:1        │               │
       │            │               │
┌──────▼───────┐    │               │
│   Device     │    │               │
│  (Beacon)    │    │               │
├──────────────┤    │               │
│ id           │    │               │
│ macAddress   │    │               │
│ uuid/major   │    │               │
│ batteryLevel │    │               │
└──────┬───────┘    │               │
       │            │               │
       │ 1:N        │               │
       │            │               │
┌──────▼───────┐    │         ┌─────▼─────┐
│     Log      │    │         │   Alert   │
│  (訊號記錄)  ├────┘         │  (警報)   │
├──────────────┤              ├───────────┤
│ id           │              │ id        │
│ rssi         │              │ type      │
│ distance     │              │ status    │
│ lat/lng      │              │ severity  │
│ timestamp    │              │ message   │
└──────────────┘              └───────────┘

       │
       │ 1:N
       │
┌──────▼───────┐              ┌───────────┐
│ LocationLog  │              │   User    │
│  (行蹤記錄)  │              │ (管理員)  │
├──────────────┤              ├───────────┤
│ id           │              │ id        │
│ lat/lng      │              │ email     │
│ activity     │              │ role      │
│ timestamp    │              │ password  │
└──────────────┘              └─────┬─────┘
                                    │
                                    └──────► Tenant (N:1)
```

## 📋 資料表詳細說明

### 1. Tenant (社區/組織)

**用途**: 多租戶架構，每個社區獨立管理

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | String | 主鍵（CUID）|
| code | String | 社區代碼（唯一，例如：DALOVE001）|
| name | String | 社區名稱 |
| address | String? | 地址 |
| contactPerson | String? | 聯絡人 |
| contactPhone | String? | 聯絡電話 |
| lineNotifyToken | String? | LINE Notify Token |
| settings | Json? | 社區設定（警報閾值等）|
| isActive | Boolean | 是否啟用 |

**關聯**:
- `hasMany` Elder
- `hasMany` Gateway
- `hasMany` User
- `hasMany` Alert

---

### 2. Elder (長者)

**用途**: 儲存受關懷長者資料

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | String | 主鍵（CUID）|
| tenantId | String | 所屬社區（外鍵）|
| name | String | 姓名 |
| phone | String? | 電話 |
| address | String? | 住址 |
| emergencyContact | String? | 緊急聯絡人 |
| emergencyPhone | String? | 緊急聯絡電話 |
| photo | String? | 照片 URL |
| status | ElderStatus | 狀態（ACTIVE/INACTIVE 等）|
| inactiveThresholdHours | Int | 不活躍警報閾值（預設 24 小時）|
| lastActivityAt | DateTime? | 最後活動時間 |
| lastSeenLocation | Json? | 最後出現位置 |

**關聯**:
- `belongsTo` Tenant
- `hasOne` Device
- `hasMany` Alert
- `hasMany` LocationLog

**索引**:
- `tenantId`
- `status`
- `lastActivityAt`

---

### 3. Device (藍牙設備/Beacon)

**用途**: Beacon 設備資訊

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | String | 主鍵（CUID）|
| elderId | String | 所屬長者（外鍵，唯一）|
| macAddress | String | MAC Address（唯一識別）|
| uuid | String? | iBeacon UUID |
| major | Int? | iBeacon Major |
| minor | Int? | iBeacon Minor |
| type | DeviceType | 設備類型（IBEACON 等）|
| batteryLevel | Int? | 電池電量（%）|
| lastSeen | DateTime? | 最後偵測時間 |
| lastRssi | Int? | 最後訊號強度 |
| lastGatewayId | String? | 最後偵測的 Gateway |

**關聯**:
- `belongsTo` Elder
- `hasMany` Log
- `belongsTo` Gateway (lastGateway)

**索引**:
- `macAddress` (unique)
- `(uuid, major, minor)`
- `lastSeen`

---

### 4. Gateway (訊號接收點)

**用途**: 固定式或移動式訊號接收點

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | String | 主鍵（CUID）|
| tenantId | String | 所屬社區（外鍵）|
| serialNumber | String | 序列號（唯一）|
| name | String | 接收點名稱 |
| location | String? | 位置描述 |
| type | GatewayType | 類型（GENERAL/BOUNDARY/MOBILE）|
| latitude | Float? | 緯度（固定式）|
| longitude | Float? | 經度（固定式）|
| deviceInfo | Json? | 設備資訊（移動式）|

**Gateway 類型**:
- `GENERAL`: 一般接收點
- `BOUNDARY`: 邊界點（觸發警報）
- `MOBILE`: 移動接收點（志工手機）

**序列號格式**:
- 固定式：`GW-{社區代碼}-{編號}`
- 移動式：`MOBILE-{型號}-{隨機碼}`

**關聯**:
- `belongsTo` Tenant
- `hasMany` Log
- `hasMany` Alert

**索引**:
- `tenantId`
- `type`
- `serialNumber` (unique)

---

### 5. Log (訊號記錄)

**用途**: Beacon 掃描記錄（核心資料表）

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | String | 主鍵（CUID）|
| deviceId | String | 設備 ID（外鍵）|
| gatewayId | String | 接收點 ID（外鍵）|
| macAddress | String | Beacon MAC Address |
| rssi | Int | 訊號強度（dBm）|
| distance | Float? | 估算距離（米）|
| proximity | Proximity? | 接近程度（IMMEDIATE/NEAR/FAR）|
| uuid/major/minor | String?/Int? | iBeacon 參數 |
| latitude | Float? | 志工位置（緯度）|
| longitude | Float? | 志工位置（經度）|
| altitude | Float? | 海拔 |
| accuracy | Float? | GPS 精確度（米）|
| timestamp | DateTime | 掃描時間 |

**關聯**:
- `belongsTo` Device
- `belongsTo` Gateway

**索引** (效能優化):
- `deviceId`
- `gatewayId`
- `macAddress`
- `timestamp`
- `(deviceId, timestamp)` - 複合索引
- `(gatewayId, timestamp)` - 複合索引

**查詢範例**:
```typescript
// 查詢特定長者今日的活動記錄
const logs = await prisma.log.findMany({
  where: {
    device: { elderId: 'elder-id' },
    timestamp: { gte: startOfDay },
  },
  include: { gateway: true },
  orderBy: { timestamp: 'desc' },
});
```

---

### 6. LocationLog (行蹤記錄)

**用途**: 長者移動軌跡（用於地圖顯示）

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | String | 主鍵（CUID）|
| elderId | String | 長者 ID（外鍵）|
| latitude | Float | 緯度 |
| longitude | Float | 經度 |
| altitude | Float? | 海拔 |
| accuracy | Float? | 精確度（米）|
| activity | String? | 活動狀態（walking/still 等）|
| address | String? | 地址（反向地理編碼）|
| sourceType | String? | 來源（beacon_scan/gps_tracking）|
| sourceLogId | String? | 關聯的 Log ID |
| sourceGatewayId | String? | 偵測到的 Gateway ID |
| timestamp | DateTime | 時間戳記 |

**關聯**:
- `belongsTo` Elder

**索引**:
- `elderId`
- `timestamp`
- `(elderId, timestamp)` - 複合索引

---

### 7. Alert (警報)

**用途**: 警報事件記錄

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | String | 主鍵（CUID）|
| tenantId | String | 社區 ID（外鍵）|
| elderId | String | 長者 ID（外鍵）|
| gatewayId | String? | 觸發的 Gateway ID |
| type | AlertType | 警報類型 |
| status | AlertStatus | 狀態（PENDING/RESOLVED 等）|
| severity | AlertSeverity | 嚴重程度 |
| title | String | 標題 |
| message | String | 訊息內容 |
| details | Json? | 詳細資訊 |
| latitude | Float? | 位置（緯度）|
| longitude | Float? | 位置（經度）|
| triggeredAt | DateTime | 觸發時間 |
| resolvedAt | DateTime? | 解決時間 |
| resolvedBy | String? | 處理人員 |
| notificationSent | Boolean | 是否已通知 |

**警報類型** (AlertType):
- `BOUNDARY`: 邊界點警報
- `INACTIVE`: 不活躍警報
- `FIRST_ACTIVITY`: 當日首次活動
- `LOW_BATTERY`: 低電量警報（未來）
- `EMERGENCY`: 緊急按鈕（未來）

**警報狀態** (AlertStatus):
- `PENDING`: 待處理
- `NOTIFIED`: 已通知
- `RESOLVED`: 已解決
- `DISMISSED`: 已忽略

**關聯**:
- `belongsTo` Tenant
- `belongsTo` Elder
- `belongsTo` Gateway (optional)

**索引**:
- `tenantId`
- `elderId`
- `type`
- `status`
- `triggeredAt`
- `(elderId, triggeredAt)` - 複合索引

---

### 8. User (後台管理員)

**用途**: 後台管理系統用戶

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | String | 主鍵（CUID）|
| tenantId | String? | 所屬社區（Super Admin 為 null）|
| email | String | Email（唯一，用於登入）|
| name | String | 姓名 |
| password | String | 加密密碼（bcrypt）|
| role | UserRole | 角色 |
| phone | String? | 電話 |
| avatar | String? | 頭像 URL |
| isActive | Boolean | 是否啟用 |
| lastLoginAt | DateTime? | 最後登入時間 |
| lastLoginIp | String? | 最後登入 IP |

**用戶角色** (UserRole):
- `SUPER_ADMIN`: 超級管理員（跨社區）
- `TENANT_ADMIN`: 社區管理員
- `STAFF`: 一般人員

**關聯**:
- `belongsTo` Tenant (optional)

**索引**:
- `tenantId`
- `email` (unique)
- `role`

---

## 🔍 查詢效能優化

### 常見查詢場景與對應索引

#### 1. 查詢長者最近活動
```sql
-- 使用索引: (deviceId, timestamp)
SELECT * FROM logs 
WHERE deviceId = ? 
ORDER BY timestamp DESC 
LIMIT 10;
```

#### 2. 查詢社區未處理警報
```sql
-- 使用索引: tenantId, status
SELECT * FROM alerts 
WHERE tenantId = ? AND status = 'PENDING'
ORDER BY triggeredAt DESC;
```

#### 3. 統計今日訊號數量
```sql
-- 使用索引: timestamp
SELECT COUNT(*) FROM logs 
WHERE timestamp >= ?;
```

#### 4. 查詢特定 Gateway 的記錄
```sql
-- 使用索引: (gatewayId, timestamp)
SELECT * FROM logs 
WHERE gatewayId = ? 
AND timestamp BETWEEN ? AND ?;
```

---

## 📈 資料量估算

假設一個社區有：
- 50 位長者
- 5 個固定 Gateway
- 10 位志工（移動 Gateway）

每日資料量：
- **Log**: ~7,200 筆/日（每位長者每 2 分鐘一筆）
- **LocationLog**: ~1,500 筆/日
- **Alert**: ~10 筆/日

**一年後資料量**:
- Log: ~260 萬筆
- LocationLog: ~55 萬筆

**建議**:
- 定期歸檔舊資料（> 6 個月）
- 使用分區表（Partitioning）
- 定期清理測試資料

---

## 🔒 資料安全考量

### 1. 敏感資料
- ✅ 密碼使用 bcrypt 加密（salt rounds: 10）
- ✅ LINE Notify Token 應加密儲存
- ✅ 長者個資需符合個資法

### 2. 存取控制
- Super Admin: 可存取所有社區
- Tenant Admin: 只能存取自己的社區
- Staff: 只能查看，不能刪除

### 3. 審計追蹤
- 記錄 `lastLoginAt` 和 `lastLoginIp`
- Alert 保留 `resolvedBy` 資訊
- 所有表格包含 `createdAt` 和 `updatedAt`

---

## 🚀 未來擴展

### 階段 2 功能
- [ ] 長者家屬帳號系統
- [ ] 巡守班表管理
- [ ] 設備電量監控
- [ ] 訊息推送系統

### 階段 3 功能
- [ ] AI 異常偵測
- [ ] 預測性警報
- [ ] 統計分析報表
- [ ] 地圖軌跡回放

---

## 📖 參考資料

- [App PRD.pdf](../../App%20PRD.pdf) - 產品需求文件
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Indexing Best Practices](https://www.postgresql.org/docs/current/indexes.html)

---

**最後更新**: 2026-01-15  
**Schema 版本**: 1.0
