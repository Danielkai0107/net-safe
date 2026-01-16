# Safe-Net API 實作摘要

**狀態**: 🚧 開發中  
**更新時間**: 2026-01-15

---

## ✅ 已完成模組

### 1. 基礎架構
- ✅ DTOs (Pagination, Response)
- ✅ Decorators (CurrentUser, Roles, Public)
- ✅ Filters (HttpException)
- ✅ Interceptors (Transform)
- ✅ Guards (JWT, Roles)

### 2. Auth 模組 (認證)
- ✅ JWT Strategy
- ✅ Local Strategy  
- ✅ Login/Profile API
- ✅ Role-based Access Control

### 3. Tenant API (社區管理)
- ✅ CRUD Operations
- ✅ Statistics Endpoint
- ✅ Super Admin Only

---

## 🚧 進行中模組

### 4. Elder API (長者管理)
建立中...

### 5. Device API (設備管理)
待開始

### 6. Gateway API (接收點管理)
待開始

### 7. Log API (訊號記錄)
待開始 - **最重要的 Gateway 上傳端點**

### 8. Alert API (警報管理)
待開始

### 9. Dashboard API (統計數據)
待開始

---

## 📋 完整 API 端點清單

### Auth (`/api/auth`)
```
POST   /auth/login          # 登入
GET    /auth/profile        # 取得個人資料
GET    /auth/me             # 取得當前用戶
```

### Tenants (`/api/tenants`)
```
GET    /tenants             # 列表（分頁）
POST   /tenants             # 新增社區
GET    /tenants/:id         # 詳情
GET    /tenants/:id/stats   # 統計資料
PATCH  /tenants/:id         # 更新
DELETE /tenants/:id         # 刪除
```

### Elders (`/api/elders`)  
```
GET    /elders              # 列表（可依 tenantId 過濾）
POST   /elders              # 新增長者
GET    /elders/:id          # 詳情
GET    /elders/:id/activity # 活動記錄
GET    /elders/:id/location # 行蹤記錄
PATCH  /elders/:id          # 更新
DELETE /elders/:id          # 刪除
```

### Devices (`/api/devices`)
```
GET    /devices             # 列表
POST   /devices             # 新增設備
GET    /devices/:id         # 詳情
PATCH  /devices/:id         # 更新
DELETE /devices/:id         # 刪除
GET    /devices/mac/:mac    # 根據 MAC Address 查詢
```

### Gateways (`/api/gateways`)
```
GET    /gateways            # 列表
POST   /gateways            # 新增接收點
GET    /gateways/:id        # 詳情
PATCH  /gateways/:id        # 更新
DELETE /gateways/:id        # 刪除
```

### Logs (`/api/logs`)
```
POST   /logs/upload         # Gateway 上傳訊號（Public）
GET    /logs                # 查詢記錄
GET    /logs/device/:id     # 特定設備記錄
GET    /logs/gateway/:id    # 特定接收點記錄
```

### Alerts (`/api/alerts`)
```
GET    /alerts              # 列表（可依 tenantId, elderId 過濾）
GET    /alerts/:id          # 詳情
PATCH  /alerts/:id/resolve  # 解決警報
PATCH  /alerts/:id/dismiss  # 忽略警報
DELETE /alerts/:id          # 刪除
```

### Dashboard (`/api/dashboard`)
```
GET    /dashboard/overview       # 總覽統計
GET    /dashboard/tenant/:id     # 社區統計
GET    /dashboard/activity       # 活動趨勢
GET    /dashboard/alerts-summary # 警報摘要
```

---

## 🔐 權限控制

| API | Super Admin | Tenant Admin | Staff |
|-----|-------------|--------------|-------|
| Auth | ✅ | ✅ | ✅ |
| Tenants (Read) | ✅ | Own Only | Own Only |
| Tenants (Write) | ✅ | ❌ | ❌ |
| Elders | ✅ | Own Tenant | Own Tenant |
| Devices | ✅ | Own Tenant | Own Tenant |
| Gateways | ✅ | Own Tenant | Own Tenant |
| Logs (Upload) | ✅ Public | ✅ Public | ✅ Public |
| Logs (Read) | ✅ | Own Tenant | Own Tenant |
| Alerts | ✅ | Own Tenant | Own Tenant |

---

## 📝 下一步

1. 完成 Elder API CRUD
2. 完成 Device API CRUD
3. 完成 Gateway API CRUD
4. **實作 Log Upload API（Gateway 最重要的端點）**
5. 實作 Alert Management API
6. 實作 Dashboard 統計 API
7. 更新 AppModule 整合所有模組
8. 測試所有端點
9. 撰寫 API 文檔

---

## 技術細節

### JWT 認證
- Secret: 從環境變數讀取 `JWT_SECRET`
- 過期時間: 7天
- Bearer Token 格式

### 資料驗證
- 使用 `class-validator`
- 所有 DTO 都有完整驗證規則

### 錯誤處理
- 統一 HTTP Exception Filter
- 標準化錯誤響應格式

### 響應格式
```json
{
  "data": { ... },
  "timestamp": "2026-01-15T14:30:00.000Z"
}
```

---

**建立者**: Community Guardian API Team  
**版本**: 1.0.0-alpha
