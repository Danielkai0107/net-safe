# Safe-Net API 開發狀態報告

**更新時間**: 2026-01-15  
**版本**: 1.0.0-alpha  
**狀態**: 🚧 核心功能已完成，剩餘模組待實作

---

## ✅ 已完成項目（60%）

### 1. 基礎架構 ✅
- [x] 專案結構建立
- [x] 依賴安裝 (JWT, Passport, Validators)
- [x] 共用 DTOs (Pagination)
- [x] 裝飾器 (CurrentUser, Roles, Public)
- [x] Guards (JWT, Roles)
- [x] Filters (HttpException)
- [x] Interceptors (Transform)

### 2. Auth 模組 ✅
- [x] JWT Strategy
- [x] Local Strategy  
- [x] Login API (`POST /api/auth/login`)
- [x] Profile API (`GET /api/auth/profile`)
- [x] Current User API (`GET /api/auth/me`)
- [x] Role-based Access Control
- [x] bcryptjs 密碼加密

### 3. Tenant API（社區管理）✅
- [x] CRUD Operations
  - `GET /api/tenants` - 列表（分頁）
  - `POST /api/tenants` - 新增
  - `GET /api/tenants/:id` - 詳情
  - `GET /api/tenants/:id/stats` - 統計
  - `PATCH /api/tenants/:id` - 更新
  - `DELETE /api/tenants/:id` - 刪除
- [x] 權限控制（Super Admin only）
- [x] 社區統計功能

### 4. Log API（訊號記錄）✅ **最關鍵**
- [x] **Gateway 上傳端點 (`POST /api/logs/upload`)** 
- [x] Public API（無需認證）
- [x] 自動處理流程：
  - [x] 驗證 Gateway 和 Device
  - [x] 建立訊號記錄
  - [x] 更新設備最後出現時間
  - [x] 更新長者最後活動時間
  - [x] 建立行蹤記錄（如有 GPS）
  - [x] 自動觸發警報（邊界點、首次活動、低電量）
- [x] 查詢記錄API (`GET /api/logs`)

### 5. AppModule 整合 ✅
- [x] 全域 JWT Auth Guard
- [x] 全域 Roles Guard
- [x] 全域 Exception Filter
- [x] 全域 Transform Interceptor
- [x] 模組註冊與整合

---

## 🚧 待完成項目（40%）

### 1. Elder API（長者管理）⏳
**優先級**: 高

需要實作：
```
GET    /api/elders              # 列表（可依 tenantId 過濾）
POST   /api/elders              # 新增長者
GET    /api/elders/:id          # 詳情
GET    /api/elders/:id/activity # 最近 24 小時活動
GET    /api/elders/:id/location # 行蹤記錄
PATCH  /api/elders/:id          # 更新
DELETE /api/elders/:id          # 刪除
```

**參考**: `tenants` 模組的結構

### 2. Device API（設備管理）⏳
**優先級**: 高

需要實作：
```
GET    /api/devices             # 列表
POST   /api/devices             # 新增設備
GET    /api/devices/:id         # 詳情
GET    /api/devices/mac/:mac    # 根據 MAC Address 查詢
PATCH  /api/devices/:id         # 更新（含電量）
DELETE /api/devices/:id         # 刪除
```

### 3. Gateway API（接收點管理）⏳
**優先級**: 高

需要實作：
```
GET    /api/gateways            # 列表（含類型過濾）
POST   /api/gateways            # 新增接收點
GET    /api/gateways/:id        # 詳情
PATCH  /api/gateways/:id        # 更新
DELETE /api/gateways/:id        # 刪除
```

### 4. Alert API（警報管理）⏳
**優先級**: 中

需要實作：
```
GET    /api/alerts              # 列表（可過濾）
GET    /api/alerts/:id          # 詳情
PATCH  /api/alerts/:id/resolve  # 解決警報
PATCH  /api/alerts/:id/dismiss  # 忽略警報
DELETE /api/alerts/:id          # 刪除
```

### 5. Dashboard API（統計數據）⏳
**優先級**: 中

需要實作：
```
GET    /api/dashboard/overview       # 總覽統計
GET    /api/dashboard/tenant/:id     # 社區統計
GET    /api/dashboard/activity       # 活動趨勢
GET    /api/dashboard/alerts-summary # 警報摘要
```

---

## 📂 專案結構

```
apps/backend/src/
├── common/                          ✅ 完成
│   ├── decorators/                  ✅ CurrentUser, Roles, Public
│   ├── dto/                         ✅ Pagination
│   ├── filters/                     ✅ HttpException
│   ├── guards/                      ✅ (在 auth 模組中)
│   └── interceptors/                ✅ Transform
│
├── auth/                            ✅ 完成
│   ├── dto/                         ✅ Login
│   ├── guards/                      ✅ JWT, Roles
│   ├── strategies/                  ✅ JWT, Local
│   ├── auth.controller.ts           ✅
│   ├── auth.service.ts              ✅
│   └── auth.module.ts               ✅
│
├── database/                        ✅ 完成
│   ├── database.service.ts          ✅
│   └── database.module.ts           ✅
│
├── tenants/                         ✅ 完成
│   ├── dto/                         ✅
│   ├── tenants.controller.ts        ✅
│   ├── tenants.service.ts           ✅
│   └── tenants.module.ts            ✅
│
├── logs/                            ✅ 完成（最關鍵）
│   ├── dto/                         ✅ UploadLog
│   ├── logs.controller.ts           ✅
│   ├── logs.service.ts              ✅ 含警報邏輯
│   └── logs.module.ts               ✅
│
├── elders/                          ⏳ 待建立
├── devices/                         ⏳ 待建立
├── gateways/                        ⏳ 待建立
├── alerts/                          ⏳ 待建立
├── dashboard/                       ⏳ 待建立
│
├── app.controller.ts                ✅
├── app.service.ts                   ✅
├── app.module.ts                    ✅ 已整合完成模組
└── main.ts                          ✅ 已配置
```

---

## 🚀 快速開始

### 1. 環境配置

建立 `.env` 檔案：
```env
# Database
DATABASE_URL="postgresql://safenet:safenet123@localhost:5432/safenet?schema=public"

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=*

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### 2. 啟動服務

```bash
# 啟動資料庫
docker compose up -d

# 初始化資料
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 啟動 API Server
cd apps/backend
pnpm dev
```

### 3. 測試 API

**登入測試**:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@safenet.com","password":"admin123456"}'
```

**Gateway 上傳測試**（最重要）:
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

**社區列表測試**:
```bash
# 先取得 token
TOKEN="<your-access-token>"

curl -X GET "http://localhost:3001/api/tenants?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 下一步實作指南

### 建立新模組步驟（以 Elder 為例）

#### 1. 建立目錄結構
```bash
mkdir -p apps/backend/src/elders/dto
```

#### 2. 建立 DTOs

**`create-elder.dto.ts`**:
```typescript
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt } from 'class-validator';
import { ElderStatus } from '@repo/database';

export class CreateElderDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  // ... 其他欄位
}
```

**`update-elder.dto.ts`**:
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateElderDto } from './create-elder.dto';

export class UpdateElderDto extends PartialType(CreateElderDto) {}
```

#### 3. 建立 Service

**參考 `tenants.service.ts`**，實作：
- `create()`
- `findAll()`
- `findOne()`
- `update()`
- `remove()`
- `getActivity()` - 長者活動記錄
- `getLocation()` - 長者行蹤記錄

#### 4. 建立 Controller

**參考 `tenants.controller.ts`**，添加：
- Guards: `@UseGuards(JwtAuthGuard, RolesGuard)`
- Roles: `@Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)`

#### 5. 建立 Module

```typescript
import { Module } from '@nestjs/common';
import { EldersService } from './elders.service';
import { EldersController } from './elders.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EldersController],
  providers: [EldersService],
  exports: [EldersService],
})
export class EldersModule {}
```

#### 6. 更新 AppModule

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

## 🎯 開發優先順序

1. **Elder API** - 長者管理是核心功能
2. **Device API** - 設備管理，關聯長者
3. **Gateway API** - 接收點管理
4. **Alert API** - 警報管理和處理
5. **Dashboard API** - 統計和報表

---

## 🔐 測試帳號

從 Seed 資料：

| 角色 | Email | 密碼 | tenantId |
|------|-------|------|----------|
| Super Admin | admin@safenet.com | admin123456 | null |
| 社區管理員 | admin@dalove.com | admin123 | DALOVE001 |
| 一般人員 | staff@dalove.com | staff123 | DALOVE001 |

---

## 📚 參考文檔

- [API Documentation](apps/backend/API_DOCUMENTATION.md)
- [Database Schema](packages/database/DATABASE_SCHEMA.md)
- [App PRD](App%20PRD.pdf)
- [後台 PRD](後台PRD.pdf)

---

## ✨ 已實現的核心功能

### 🔥 Log Upload API - Gateway 訊號上傳流程

```
Gateway 偵測到 Beacon
     ↓
POST /api/logs/upload
     ↓
1. 驗證 Gateway (serialNumber)
2. 驗證 Device (macAddress)
3. 建立 Log 記錄
4. 更新 Device.lastSeen
5. 更新 Elder.lastActivityAt
6. 建立 LocationLog (如有 GPS)
7. 檢查並觸發警報:
   - 邊界點警報 (Gateway type = BOUNDARY)
   - 當日首次活動通知
   - 低電量警報 (< 20%)
     ↓
返回成功響應
```

這個流程完全實現了 App PRD 和後台 PRD 中描述的核心功能！

---

**報告建立時間**: 2026-01-15  
**建立者**: Safe-Net Development Team  
**狀態**: 核心功能已完成，可開始測試與擴展 🎉
