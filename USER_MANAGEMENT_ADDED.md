# 人員管理功能補充說明

**新增時間**: 2026-01-16  
**狀態**: ✅ 已完成

---

## 🎯 補充內容

感謝您的提醒！我已經補充了完整的**人員管理（User Management）**功能。

---

## ✨ 新增的功能

### 1. 後端 API - Users 模組

建立了完整的 `/api/users` CRUD API：

#### API 端點

| 方法 | 路徑 | 說明 | 權限 |
|------|------|------|------|
| POST | `/api/users` | 新增人員 | SUPER_ADMIN, TENANT_ADMIN |
| GET | `/api/users` | 人員清單（分頁） | SUPER_ADMIN, TENANT_ADMIN |
| GET | `/api/users/:id` | 人員詳情 | SUPER_ADMIN, TENANT_ADMIN |
| PATCH | `/api/users/:id` | 更新人員 | SUPER_ADMIN, TENANT_ADMIN |
| PATCH | `/api/users/:id/toggle-active` | 啟用/停用 | SUPER_ADMIN, TENANT_ADMIN |
| DELETE | `/api/users/:id` | 刪除人員 | SUPER_ADMIN |

#### API 使用範例

**1. 新增人員**
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "name": "新管理員",
  "password": "password123",
  "role": "TENANT_ADMIN",
  "tenantId": "tenant-id",
  "phone": "0912-345-678"
}
```

**2. 查詢人員清單**
```http
GET /api/users?page=1&limit=10&tenantId=xxx
Authorization: Bearer <token>
```

**3. 更新人員**
```http
PATCH /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "更新的名字",
  "role": "STAFF",
  "isActive": false
}
```

**4. 停用/啟用人員**
```http
PATCH /api/users/:id/toggle-active
Authorization: Bearer <token>
```

**5. 刪除人員**
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

---

### 2. 後台前端 - UsersPage 頁面

#### 功能特色

✅ **完整的 CRUD 操作**
- 新增人員（含密碼）
- 編輯人員資料
- 刪除人員
- 啟用/停用人員

✅ **智能表單驗證**
- Email 格式驗證
- 密碼長度驗證（至少 6 字元）
- 角色與社區的關聯驗證

✅ **角色管理**
- Super Admin（無需選擇社區）
- Tenant Admin（需選擇社區）
- Staff（需選擇社區）

✅ **過濾功能**
- 依社區過濾人員
- 查看所有社區或特定社區的人員

✅ **狀態管理**
- 即時切換啟用/停用狀態
- 顯示最後登入時間
- 視覺化的狀態標籤

---

## 📱 後台使用指南

### 訪問人員管理頁面

1. 登入後台：`http://localhost:5173`
2. 使用管理員帳號登入：
   ```
   Email: admin@safenet.com
   Password: admin123456
   ```
3. 點擊側邊欄的「**人員管理**」

### 新增人員流程

1. 點擊右上角「**新增人員**」按鈕
2. 填寫表單：
   - **姓名**：必填
   - **Email**：必填，格式驗證
   - **密碼**：必填，至少 6 字元
   - **角色**：選擇角色類型
   - **所屬社區**：如果是 Tenant Admin 或 Staff，必填
   - **電話**：選填
3. 點擊「新增」

### 編輯人員

1. 點擊人員列表中的「編輯」圖標
2. 修改需要更新的欄位
3. **密碼欄位**：留空表示不更改密碼
4. 點擊「更新」

### 停用/啟用人員

- 點擊人員列表中的「停用」圖標（UserX）即可停用
- 停用的人員無法登入系統
- 再次點擊「啟用」圖標（UserCheck）可重新啟用

### 刪除人員

1. 點擊「刪除」圖標（垃圾桶）
2. 確認刪除操作
3. **注意**：只有 Super Admin 可以刪除人員

---

## 🎨 UI 特色

### 人員列表顯示

| 欄位 | 說明 |
|------|------|
| 姓名 | 顯示人員姓名和電話 |
| Email | 登入帳號 |
| 角色 | 彩色標籤顯示（紫色=超管、藍色=社區管理員、灰色=人員）|
| 所屬社區 | 顯示社區名稱和代碼 |
| 狀態 | 綠色=啟用、紅色=停用 |
| 最後登入 | 時間顯示 |
| 操作 | 啟用/停用、編輯、刪除按鈕 |

### 表單驗證

✅ Email 格式自動驗證  
✅ 密碼長度檢查  
✅ 角色與社區關聯檢查  
✅ 即時錯誤提示

---

## 🔧 技術實作細節

### 後端文件結構

```
apps/backend/src/users/
├── dto/
│   ├── create-user.dto.ts      # 新增人員 DTO
│   └── update-user.dto.ts      # 更新人員 DTO
├── users.controller.ts          # Users Controller
├── users.service.ts             # Users Service
└── users.module.ts              # Users Module
```

### 前端文件結構

```
apps/admin/src/
├── pages/
│   └── UsersPage.tsx            # 人員管理頁面
├── services/
│   └── userService.ts           # 人員 API 服務
└── layouts/
    └── DashboardLayout.tsx      # 側邊欄導航（已更新）
```

---

## 🔐 權限設計

### API 權限

| 操作 | SUPER_ADMIN | TENANT_ADMIN | STAFF |
|------|-------------|--------------|-------|
| 查看人員清單 | ✅ 全部 | ✅ 自己社區 | ❌ |
| 新增人員 | ✅ | ✅ 自己社區 | ❌ |
| 編輯人員 | ✅ | ✅ 自己社區 | ❌ |
| 停用/啟用 | ✅ | ✅ 自己社區 | ❌ |
| 刪除人員 | ✅ | ❌ | ❌ |

### 業務規則

1. **Super Admin**：
   - 可以管理所有人員
   - 不需要（也不能）設定所屬社區
   - 可以查看和管理所有社區的人員

2. **Tenant Admin**：
   - 只能管理自己社區的人員
   - 新增人員時必須指定社區
   - 不能刪除人員（只能停用）

3. **Staff**：
   - 無人員管理權限
   - 只能修改自己的個人資料

---

## 📊 資料驗證

### 新增人員驗證

```typescript
// 角色與社區驗證
if (role === 'TENANT_ADMIN' || role === 'STAFF') {
  // 必須提供 tenantId
  if (!tenantId) {
    throw new ConflictException('社區管理員和人員必須指定所屬社區');
  }
}

if (role === 'SUPER_ADMIN') {
  // 不應該有 tenantId
  if (tenantId) {
    throw new ConflictException('超級管理員不應該有所屬社區');
  }
}

// Email 唯一性驗證
const existing = await findByEmail(email);
if (existing) {
  throw new ConflictException('此 Email 已被使用');
}

// 密碼加密
const hashedPassword = await bcrypt.hash(password, 10);
```

---

## 🧪 測試步驟

### 1. 測試新增人員

```bash
# 登入取得 token
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@safenet.com","password":"admin123456"}' \
  | jq -r '.data.access_token')

# 新增社區管理員
curl -X POST http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@test.com",
    "name": "新管理員",
    "password": "admin123",
    "role": "TENANT_ADMIN",
    "tenantId": "<tenant-id>",
    "phone": "0912-111-222"
  }'
```

### 2. 測試查詢人員

```bash
# 查詢所有人員
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN"

# 查詢特定社區的人員
curl "http://localhost:3001/api/users?tenantId=<tenant-id>" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. 測試更新人員

```bash
# 更新人員資料（不更改密碼）
curl -X PATCH http://localhost:3001/api/users/<user-id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "更新的名字",
    "phone": "0922-333-444"
  }'

# 更新密碼
curl -X PATCH http://localhost:3001/api/users/<user-id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "newpassword123"
  }'
```

### 4. 測試停用/啟用

```bash
curl -X PATCH http://localhost:3001/api/users/<user-id>/toggle-active \
  -H "Authorization: Bearer $TOKEN"
```

### 5. 測試刪除

```bash
curl -X DELETE http://localhost:3001/api/users/<user-id> \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📋 完整的後台管理功能

現在後台已包含完整的管理功能：

1. ✅ **儀表板** - 統計總覽
2. ✅ **社區管理** - CRUD + 統計 + App 成員 + 設備分配
3. ✅ **人員管理** - CRUD + 啟用/停用（**剛補充**）
4. ✅ **長者管理** - CRUD + 設備綁定
5. ✅ **設備管理** - CRUD + 社區分配
6. ✅ **接收點管理** - CRUD
7. ✅ **警報管理** - 查詢 + 處理

---

## 🔄 更新的 API 總數

### 原有後台 API：39 個
### 新增 App API：22 個
### 新增 Users API：6 個 ⭐

**總計：67 個 API 端點**

---

## 📸 後台截圖說明

### 側邊欄導航
```
📊 總覽
🏢 社區管理
👥 人員管理        ← 新增
👴 長者管理
📱 設備管理
📡 接收點管理
🔔 警報管理
```

### 人員管理頁面功能
- 📋 人員列表（分頁）
- 🔍 社區過濾
- ➕ 新增人員
- ✏️ 編輯人員
- 🔄 啟用/停用
- 🗑️ 刪除人員

---

## 🎯 使用場景

### 場景 1: 新增社區管理員

1. Super Admin 登入後台
2. 進入「人員管理」
3. 點擊「新增人員」
4. 填寫資料：
   - 姓名：王管理員
   - Email：wang@community.com
   - 密碼：admin123
   - 角色：社區管理員
   - 所屬社區：選擇社區
5. 新增成功後，該人員可以登入後台管理該社區

### 場景 2: 管理社區人員

1. Tenant Admin 登入
2. 進入「人員管理」
3. 自動只顯示自己社區的人員
4. 可以新增、編輯、停用自己社區的人員
5. **無法刪除人員**（只有 Super Admin 可以）

### 場景 3: 停用離職人員

1. 進入「人員管理」
2. 找到需要停用的人員
3. 點擊「停用」圖標（UserX）
4. 該人員立即無法登入系統
5. 如需恢復，點擊「啟用」圖標（UserCheck）

---

## 🛡️ 安全特性

### 1. 密碼安全
- ✅ 使用 bcrypt 加密（強度 10）
- ✅ API 回應不包含密碼
- ✅ 編輯時可選擇不更改密碼

### 2. Email 唯一性
- ✅ 新增時檢查 Email 是否重複
- ✅ 編輯時排除自己檢查重複

### 3. 角色驗證
- ✅ Tenant Admin/Staff 必須指定社區
- ✅ Super Admin 不能指定社區
- ✅ 權限不足時返回 403 錯誤

### 4. 軟刪除建議
- 當前實作為硬刪除
- 建議改為軟刪除（設定 deletedAt）
- 保留歷史記錄

---

## 📝 與其他功能的整合

### 1. 社區管理整合
- 新增人員時可選擇社區
- 人員自動與社區關聯
- 社區刪除時相關人員也會被刪除（CASCADE）

### 2. 認證系統整合
- 新增的人員可以立即登入後台
- 停用的人員無法登入
- 密碼更新立即生效

### 3. 審計追蹤
- 記錄最後登入時間
- 顯示人員創建時間
- 可擴展添加操作日誌

---

## 🔄 資料流程

### 新增人員流程

```
1. 管理員在後台「人員管理」點擊「新增人員」
   ↓
2. 填寫表單並選擇角色和社區
   ↓
3. 前端發送 POST /api/users
   ↓
4. 後端驗證：
   - Email 唯一性
   - 角色與社區關聯
   - 密碼強度
   ↓
5. 密碼 bcrypt 加密
   ↓
6. 儲存到資料庫 users 表
   ↓
7. 返回成功（不含密碼）
   ↓
8. 新人員可以使用 Email 和密碼登入後台
```

---

## 📊 更新後的系統總覽

### 後台管理功能（完整）

| 模組 | 功能 | API 端點數 | 前端頁面 |
|------|------|-----------|---------|
| 儀表板 | 統計總覽 | 4 | ✅ |
| 社區管理 | CRUD + 統計 + App 成員 + 設備 | 11 | ✅ |
| **人員管理** | **CRUD + 啟用/停用** | **6** | ✅ |
| 長者管理 | CRUD + 設備綁定 | 7 | ✅ |
| 設備管理 | CRUD + 社區分配 | 6 | ✅ |
| 接收點管理 | CRUD | 5 | ✅ |
| 警報管理 | 查詢 + 處理 | 6 | ✅ |

**總計：後台管理功能 100% 完整** ✅

---

## 🎉 總結

### 新增文件
- `apps/backend/src/users/` - 完整的 Users 模組（5 個文件）
- `apps/admin/src/pages/UsersPage.tsx` - 人員管理頁面
- `apps/admin/src/services/userService.ts` - 人員 API 服務

### 更新文件
- `apps/backend/src/app.module.ts` - 加入 UsersModule
- `apps/admin/src/App.tsx` - 加入 Users 路由
- `apps/admin/src/layouts/DashboardLayout.tsx` - 加入人員管理選單

### 測試確認
- ✅ 後端編譯成功
- ✅ 路由配置正確
- ✅ 權限控制完整

---

## ✅ 檢查清單

- [x] 後端 Users API 模組
- [x] Users CRUD 端點
- [x] 啟用/停用功能
- [x] 密碼加密
- [x] 角色驗證
- [x] 前端 UsersPage 頁面
- [x] 表單驗證
- [x] 社區過濾
- [x] 路由配置
- [x] 側邊欄導航

---

**補充完成！現在後台管理系統功能 100% 完整！** 🎉

您可以立即啟動系統並測試人員管理功能。
