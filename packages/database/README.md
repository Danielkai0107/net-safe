# @repo/database

Safe-Net 資料庫層，使用 Prisma ORM + PostgreSQL。

## 📦 套件資訊

- **ORM**: Prisma 5.22.0
- **資料庫**: PostgreSQL 15
- **語言**: TypeScript

## 🗄️ 資料模型

### 核心實體

1. **Tenant** - 社區/組織
2. **Elder** - 長者
3. **Device** - 藍牙設備（Beacon）
4. **Gateway** - 訊號接收點
5. **Log** - 訊號記錄
6. **LocationLog** - 行蹤記錄
7. **Alert** - 警報
8. **User** - 後台管理員

### 實體關聯

```
Tenant (社區)
├── Elders (長者) *
├── Gateways (接收點) *
├── Users (管理員) *
└── Alerts (警報) *

Elder (長者)
├── Device (設備) 1
├── Alerts (警報) *
└── LocationLogs (行蹤) *

Device (設備)
├── Elder (長者) 1
└── Logs (訊號記錄) *

Gateway (接收點)
├── Tenant (社區) 1
├── Logs (訊號記錄) *
└── Alerts (警報) *
```

## 🚀 快速開始

### 1. 環境設定

建立 `.env` 文件：

```bash
DATABASE_URL="postgresql://safenet:safenet123@localhost:5432/safenet?schema=public"
```

### 2. 生成 Prisma Client

```bash
pnpm db:generate
```

### 3. 執行資料庫遷移

```bash
pnpm db:migrate
```

### 4. 初始化測試資料

```bash
pnpm db:seed
```

這將建立：
- ✅ 1 個 Super Admin 帳號
- ✅ 1 個測試社區（大愛社區）
- ✅ 3 個管理員帳號（超級管理員、社區管理員、一般人員）
- ✅ 3 個 Gateway（2 個固定式 + 1 個移動式）
- ✅ 2 個長者資料
- ✅ 2 個 Beacon 設備
- ✅ 測試訊號和行蹤記錄

## 📝 可用指令

```bash
# 生成 Prisma Client
pnpm db:generate

# 建立並執行新的遷移
pnpm db:migrate

# 直接推送 schema 到資料庫（開發用）
pnpm db:push

# 開啟 Prisma Studio（視覺化資料庫管理）
pnpm db:studio

# 執行 Seed 腳本
pnpm db:seed

# 重置資料庫（清除所有資料並重新遷移 + seed）
pnpm db:reset
```

## 💻 使用範例

### 基本查詢

```typescript
import { prisma } from '@repo/database';

// 查詢所有社區
const tenants = await prisma.tenant.findMany({
  where: { isActive: true },
  include: {
    elders: true,
    gateways: true,
  },
});

// 查詢特定長者
const elder = await prisma.elder.findUnique({
  where: { id: 'elder-id' },
  include: {
    device: true,
    tenant: true,
    alerts: {
      where: { status: 'PENDING' },
      orderBy: { triggeredAt: 'desc' },
    },
  },
});

// 建立訊號記錄
const log = await prisma.log.create({
  data: {
    deviceId: 'device-id',
    gatewayId: 'gateway-id',
    macAddress: 'AA:BB:CC:DD:EE:FF',
    rssi: -65,
    distance: 2.5,
    proximity: 'NEAR',
    latitude: 25.033,
    longitude: 121.5654,
    timestamp: new Date(),
  },
});
```

### 建立警報

```typescript
import { AlertType, AlertSeverity } from '@repo/database';

const alert = await prisma.alert.create({
  data: {
    tenantId: 'tenant-id',
    elderId: 'elder-id',
    gatewayId: 'gateway-id',
    type: AlertType.BOUNDARY,
    severity: AlertSeverity.HIGH,
    title: '邊界點警報',
    message: '陳阿公在社區大門被偵測到',
    latitude: 25.033,
    longitude: 121.5654,
  },
});
```

### 查詢統計

```typescript
// 統計今日訊號數量
const today = new Date();
today.setHours(0, 0, 0, 0);

const logCount = await prisma.log.count({
  where: {
    timestamp: { gte: today },
  },
});

// 查詢長者最後出現位置
const lastLocation = await prisma.locationLog.findFirst({
  where: { elderId: 'elder-id' },
  orderBy: { timestamp: 'desc' },
});

// 統計未處理警報
const pendingAlerts = await prisma.alert.count({
  where: {
    status: 'PENDING',
    tenantId: 'tenant-id',
  },
});
```

## 🔑 測試帳號

執行 `pnpm db:seed` 後可使用以下帳號：

### Super Admin（超級管理員）
- **Email**: admin@safenet.com
- **Password**: admin123456
- **權限**: 跨社區管理

### 社區管理員（大愛社區）
- **Email**: admin@dalove.com
- **Password**: admin123
- **權限**: 大愛社區完整管理

### 一般人員（大愛社區）
- **Email**: staff@dalove.com
- **Password**: staff123
- **權限**: 基本操作

## 📊 資料庫索引優化

為了查詢效能，已為以下欄位建立索引：

### Log 表格
- `deviceId` - 設備查詢
- `gatewayId` - 接收點查詢
- `macAddress` - MAC Address 查詢
- `timestamp` - 時間範圍查詢
- `(deviceId, timestamp)` - 複合索引
- `(gatewayId, timestamp)` - 複合索引

### Alert 表格
- `elderId` - 長者警報查詢
- `type` - 警報類型過濾
- `status` - 狀態過濾
- `triggeredAt` - 時間排序
- `(elderId, triggeredAt)` - 複合索引

### 其他索引
- Elder: `tenantId`, `status`, `lastActivityAt`
- Device: `macAddress`, `(uuid, major, minor)`, `lastSeen`
- Gateway: `tenantId`, `type`, `serialNumber`
- User: `email`, `role`, `tenantId`

## 🔒 資料安全

### 密碼加密

使用 bcrypt 進行密碼加密：

```typescript
import * as bcrypt from 'bcrypt';

// 加密密碼
const hashedPassword = await bcrypt.hash('plainPassword', 10);

// 驗證密碼
const isValid = await bcrypt.compare('plainPassword', hashedPassword);
```

### Cascade 刪除

已設定適當的級聯刪除規則：
- 刪除 Tenant → 自動刪除所有關聯的 Elder、Gateway、User、Alert
- 刪除 Elder → 自動刪除關聯的 Device、Alert、LocationLog
- 刪除 Device → 自動刪除關聯的 Log

## 📖 相關文件

- [Prisma 官方文件](https://www.prisma.io/docs)
- [PostgreSQL 文件](https://www.postgresql.org/docs/)
- [App PRD.pdf](../../App%20PRD.pdf) - 產品需求文件

## 🐛 常見問題

### Q: Prisma Client 沒有生成？
```bash
pnpm db:generate
```

### Q: 遷移失敗？
```bash
# 檢查資料庫連線
docker compose ps

# 重置資料庫
pnpm db:reset
```

### Q: 如何查看資料庫內容？
```bash
# 開啟 Prisma Studio
pnpm db:studio
# 訪問 http://localhost:5555
```

### Q: 如何清空資料庫？
```bash
# 完整重置（包含重新 seed）
pnpm db:reset

# 或手動清空
docker compose down -v
docker compose up -d
pnpm db:migrate
pnpm db:seed
```

## 📄 授權

ISC
