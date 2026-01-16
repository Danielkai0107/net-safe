# ✅ Safe-Net 資料庫設計完成報告

**日期**: 2026-01-15  
**版本**: 1.0  
**狀態**: ✅ 完成

---

## 📋 完成項目總覽

### ✅ 已完成項目

1. **Prisma Schema 設計** - 完整實作 8 個核心資料模型
2. **關聯關係建立** - 正確設定所有實體間的關聯
3. **索引優化** - 為高頻查詢欄位建立索引
4. **Seed 腳本** - 建立測試資料初始化腳本
5. **文檔撰寫** - 完整的使用文檔和架構說明

---

## 🗄️ 資料庫架構摘要

### 核心實體 (8 個)

| 實體            | 用途        | 關鍵欄位                               |
| --------------- | ----------- | -------------------------------------- |
| **Tenant**      | 社區/組織   | code, name, lineNotifyToken            |
| **Elder**       | 長者資料    | name, emergencyContact, lastActivityAt |
| **Device**      | Beacon 設備 | macAddress, uuid, major, minor         |
| **Gateway**     | 訊號接收點  | serialNumber, type, location           |
| **Log**         | 訊號記錄    | rssi, distance, latitude, longitude    |
| **LocationLog** | 行蹤記錄    | latitude, longitude, activity          |
| **Alert**       | 警報事件    | type, status, severity, message        |
| **User**        | 後台管理員  | email, role, password                  |

### 關聯關係

```
Tenant (1) ←→ (N) Elder
Tenant (1) ←→ (N) Gateway
Tenant (1) ←→ (N) User
Tenant (1) ←→ (N) Alert

Elder (1) ←→ (1) Device
Elder (1) ←→ (N) Alert
Elder (1) ←→ (N) LocationLog

Device (1) ←→ (N) Log

Gateway (1) ←→ (N) Log
Gateway (1) ←→ (N) Alert
```

---

## 🎯 核心功能對應

### 1. 藍牙掃描系統 → Log 表格

**對應欄位**:

- `macAddress`: Beacon MAC Address
- `rssi`: 訊號強度
- `distance`: 估算距離
- `proximity`: 接近程度 (IMMEDIATE/NEAR/FAR)
- `uuid`, `major`, `minor`: iBeacon 識別參數

**索引優化**:

```prisma
@@index([deviceId])
@@index([gatewayId])
@@index([macAddress])
@@index([timestamp])
@@index([deviceId, timestamp])  // 複合索引
@@index([gatewayId, timestamp]) // 複合索引
```

### 2. GPS 定位系統 → LocationLog 表格

**對應欄位**:

- `latitude`, `longitude`: GPS 座標
- `altitude`: 海拔高度
- `accuracy`: 定位精確度
- `activity`: 活動狀態 (walking/still/running)
- `address`: 反向地理編碼地址

### 3. 移動接收點系統 → Gateway 表格

**Gateway 類型**:

- `GENERAL`: 一般接收點（固定式）
- `BOUNDARY`: 邊界點（觸發警報）
- `MOBILE`: 移動接收點（志工手機）

**序列號格式**:

- 固定式: `GW-{社區代碼}-{編號}`
  - 範例: `GW-DALOVE-001`
- 移動式: `MOBILE-{型號}-{隨機碼}`
  - 範例: `MOBILE-IPHONE-A3K9F2`

**移動接收點資訊** (`deviceInfo` JSON):

```json
{
  "brand": "Apple",
  "model": "iPhone 15",
  "osVersion": "iOS 17.2",
  "appVersion": "1.0.0"
}
```

### 4. 智能警報系統 → Alert 表格

**警報類型** (AlertType):

- `BOUNDARY`: 邊界點警報（長者經過邊界點）
- `INACTIVE`: 不活躍警報（超過設定時間未活動）
- `FIRST_ACTIVITY`: 當日首次活動通知
- `LOW_BATTERY`: 低電量警報（未來功能）
- `EMERGENCY`: 緊急按鈕（未來功能）

**警報狀態** (AlertStatus):

- `PENDING`: 待處理
- `NOTIFIED`: 已通知
- `RESOLVED`: 已解決
- `DISMISSED`: 已忽略

**嚴重程度** (AlertSeverity):

- `LOW`: 低（一般通知）
- `MEDIUM`: 中（需關注）
- `HIGH`: 高（需立即處理）
- `CRITICAL`: 緊急（最高優先）

---

## 🔐 測試資料 (Seed)

執行 `pnpm db:seed` 後會建立：

### 管理員帳號 (3 個)

| 角色        | Email             | 密碼        | 權限             |
| ----------- | ----------------- | ----------- | ---------------- |
| Super Admin | admin@safenet.com | admin123456 | 跨社區完整管理   |
| 社區管理員  | admin@dalove.com  | admin123    | 大愛社區完整管理 |
| 一般人員    | staff@dalove.com  | staff123    | 基本查看權限     |

### 測試社區 (1 個)

- **名稱**: 大愛社區
- **代碼**: DALOVE001
- **地址**: 台北市信義區信義路五段 7 號
- **聯絡人**: 王志工
- **電話**: 02-2345-6789

### Gateway 接收點 (3 個)

| 名稱     | 序列號               | 類型     | 位置         |
| -------- | -------------------- | -------- | ------------ |
| 社區大門 | GW-DALOVE-001        | BOUNDARY | 社區正門入口 |
| 活動中心 | GW-DALOVE-002        | GENERAL  | 社區活動中心 |
| 志工巡守 | MOBILE-IPHONE-A3K9F2 | MOBILE   | 移動接收點   |

### 長者與 Beacon (2 組)

| 長者   | Beacon MAC        | UUID                                 | Major/Minor |
| ------ | ----------------- | ------------------------------------ | ----------- |
| 陳阿公 | AA:BB:CC:DD:EE:01 | FDA50693-A4E2-4FB1-AFCF-C6EB07647825 | 100/1       |
| 林阿嬤 | AA:BB:CC:DD:EE:02 | FDA50693-A4E2-4FB1-AFCF-C6EB07647825 | 100/2       |

### 測試記錄

- ✅ 2 筆訊號記錄 (Log)
- ✅ 2 筆行蹤記錄 (LocationLog)

---

## 📁 檔案結構

```
packages/database/
├── prisma/
│   ├── schema.prisma          # Prisma Schema 定義
│   └── seed.ts                # 測試資料初始化腳本
├── src/
│   └── index.ts               # PrismaClient 導出
├── package.json               # 套件配置
├── tsconfig.json              # TypeScript 配置
├── .env                       # 環境變數（資料庫連線）
├── README.md                  # 使用文檔
└── DATABASE_SCHEMA.md         # 資料庫架構詳細說明
```

---

## 🚀 使用指南

### 初次設定流程

```bash
# 1. 確保 Docker 資料庫已啟動
docker compose up -d

# 2. 生成 Prisma Client
pnpm db:generate

# 3. 執行資料庫遷移
pnpm db:migrate

# 4. 初始化測試資料
pnpm db:seed
```

### 常用指令

```bash
# 開發指令
pnpm db:generate    # 生成 Prisma Client
pnpm db:migrate     # 執行遷移（建立新的遷移）
pnpm db:push        # 直接推送 schema（開發用）
pnpm db:studio      # 開啟 Prisma Studio
pnpm db:seed        # 執行 seed 腳本
pnpm db:reset       # 重置資料庫（清空 + 遷移 + seed）

# 建置指令
pnpm build          # 編譯 TypeScript
pnpm dev            # 監聽模式編譯
```

---

## 💻 程式碼範例

### 基本查詢

```typescript
import { prisma } from "@repo/database";

// 查詢所有活躍長者
const elders = await prisma.elder.findMany({
  where: {
    isActive: true,
    status: "ACTIVE",
  },
  include: {
    device: true,
    tenant: true,
  },
});

// 查詢長者最近 10 筆訊號記錄
const logs = await prisma.log.findMany({
  where: {
    device: { elderId: "elder-id" },
  },
  include: {
    gateway: true,
  },
  orderBy: { timestamp: "desc" },
  take: 10,
});
```

### 建立訊號記錄

```typescript
// 從 App 上傳的 Beacon 掃描結果
const log = await prisma.log.create({
  data: {
    deviceId: device.id,
    gatewayId: gateway.id,
    macAddress: "AA:BB:CC:DD:EE:01",
    rssi: -65,
    distance: 2.5,
    proximity: "NEAR",
    uuid: "FDA50693-A4E2-4FB1-AFCF-C6EB07647825",
    major: 100,
    minor: 1,
    latitude: 25.033,
    longitude: 121.5654,
    accuracy: 10,
    timestamp: new Date(),
  },
});

// 同時更新長者最後活動時間
await prisma.elder.update({
  where: { id: device.elderId },
  data: {
    lastActivityAt: new Date(),
    lastSeenLocation: {
      lat: 25.033,
      lng: 121.5654,
      address: "社區活動中心",
    },
  },
});
```

### 建立警報

```typescript
import { AlertType, AlertSeverity } from "@repo/database";

// 邊界點警報
const alert = await prisma.alert.create({
  data: {
    tenantId: tenant.id,
    elderId: elder.id,
    gatewayId: gateway.id,
    type: AlertType.BOUNDARY,
    severity: AlertSeverity.HIGH,
    title: "邊界點警報",
    message: `${elder.name} 在 ${gateway.name} 被偵測到`,
    latitude: gateway.latitude,
    longitude: gateway.longitude,
    location: gateway.location,
    details: {
      rssi: -65,
      distance: 2.5,
      gatewayType: "BOUNDARY",
    },
  },
});
```

### 查詢統計

```typescript
// 今日活動統計
const today = new Date();
today.setHours(0, 0, 0, 0);

const stats = {
  // 今日訊號總數
  totalLogs: await prisma.log.count({
    where: { timestamp: { gte: today } },
  }),

  // 今日活躍長者數
  activeElders: await prisma.elder.count({
    where: {
      lastActivityAt: { gte: today },
      status: "ACTIVE",
    },
  }),

  // 待處理警報數
  pendingAlerts: await prisma.alert.count({
    where: {
      status: "PENDING",
      tenantId: tenant.id,
    },
  }),
};
```

---

## 📊 效能考量

### 已優化項目

1. **索引建立**:

   - 所有外鍵欄位
   - 時間戳記欄位
   - 常用查詢欄位
   - 複合索引（deviceId + timestamp 等）

2. **查詢優化**:

   - 使用 `include` 減少 N+1 查詢
   - 適當的 `select` 限制欄位
   - `take` 和 `skip` 分頁處理

3. **資料架構**:
   - 適當的正規化設計
   - JSON 欄位用於彈性資料（settings, deviceInfo）
   - Cascade 刪除避免孤兒資料

### 未來優化建議

1. **資料歸檔**:

   - Log 表格每月歸檔一次
   - 保留最近 6 個月的熱資料

2. **分區表** (Partitioning):

   - Log 表格按月分區
   - LocationLog 表格按月分區

3. **快取策略**:
   - Redis 快取長者基本資料
   - 快取社區設定
   - 快取 Gateway 列表

---

## ✅ 驗證清單

### 資料模型完整性

- [x] Tenant 模型（社區）
- [x] Elder 模型（長者）
- [x] Device 模型（Beacon）
- [x] Gateway 模型（接收點）
- [x] Log 模型（訊號記錄）
- [x] LocationLog 模型（行蹤）
- [x] Alert 模型（警報）
- [x] User 模型（管理員）

### 關聯關係

- [x] Tenant ↔ Elder (1:N)
- [x] Tenant ↔ Gateway (1:N)
- [x] Tenant ↔ User (1:N)
- [x] Tenant ↔ Alert (1:N)
- [x] Elder ↔ Device (1:1)
- [x] Elder ↔ Alert (1:N)
- [x] Elder ↔ LocationLog (1:N)
- [x] Device ↔ Log (1:N)
- [x] Gateway ↔ Log (1:N)
- [x] Gateway ↔ Alert (1:N)

### 索引優化

- [x] Log 表格索引（6 個）
- [x] Alert 表格索引（6 個）
- [x] Elder 表格索引（3 個）
- [x] Device 表格索引（3 個）
- [x] Gateway 表格索引（3 個）
- [x] User 表格索引（3 個）

### Enum 定義

- [x] ElderStatus（長者狀態）
- [x] DeviceType（設備類型）
- [x] GatewayType（接收點類型）
- [x] Proximity（接近程度）
- [x] AlertType（警報類型）
- [x] AlertStatus（警報狀態）
- [x] AlertSeverity（嚴重程度）
- [x] UserRole（用戶角色）

### 功能腳本

- [x] Seed 腳本（seed.ts）
- [x] PrismaClient 導出（index.ts）
- [x] TypeScript 配置
- [x] Package.json 腳本配置

### 文檔

- [x] README.md（使用文檔）
- [x] DATABASE_SCHEMA.md（架構詳解）
- [x] DATABASE_SETUP_COMPLETE.md（完成報告）

---

## 🎓 學習資源

### Prisma 文檔

- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)

### PostgreSQL 文檔

- [Indexing Best Practices](https://www.postgresql.org/docs/current/indexes.html)
- [JSON Types](https://www.postgresql.org/docs/current/datatype-json.html)

---

## 🎉 下一步行動

### 立即可做

1. **啟動資料庫**:

   ```bash
   docker compose up -d
   ```

2. **初始化資料庫**:

   ```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```

3. **驗證設定**:
   ```bash
   pnpm db:studio
   # 訪問 http://localhost:5555
   ```

### 後續開發

1. **後端 API 開發**:

   - 實作 RESTful API endpoints
   - 整合 PrismaClient
   - 建立業務邏輯層

2. **測試撰寫**:

   - 單元測試
   - 整合測試
   - E2E 測試

3. **部署準備**:
   - 環境變數管理
   - 資料庫備份策略
   - 監控設定

---

## 📞 支援

如有任何問題，請參考：

- 📖 [packages/database/README.md](packages/database/README.md)
- 📊 [packages/database/DATABASE_SCHEMA.md](packages/database/DATABASE_SCHEMA.md)
- 🔗 [Prisma 官方文檔](https://www.prisma.io/docs)

---

**報告生成時間**: 2026-01-15  
**Prisma 版本**: 5.22.0  
**PostgreSQL 版本**: 15-alpine  
**狀態**: ✅ 準備就緒
