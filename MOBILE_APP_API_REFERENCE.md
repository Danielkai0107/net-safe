# Safe-Net Mobile App API 參考文檔

**版本**: 1.0.0  
**Base URL**: `http://localhost:3001/api`  
**認證方式**: JWT Bearer Token（App 專用）

---

## 📱 App API 端點（共 22 個）

### 認證 API (`/api/app/auth`)

#### 1. 註冊

```http
POST /api/app/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "王小明",
  "password": "password123",
  "phone": "0912-345-678"
}
```

**Response:**
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "王小明",
      "phone": "0912-345-678"
    }
  },
  "timestamp": "2026-01-16T..."
}
```

#### 2. 登入

```http
POST /api/app/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 3. 取得個人資料

```http
GET /api/app/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "id": "...",
    "email": "user@example.com",
    "name": "王小明",
    "phone": "0912-345-678",
    "tenants": [
      {
        "id": "...",
        "name": "大愛社區",
        "code": "DALOVE001",
        "role": "ADMIN",
        "joinedAt": "..."
      }
    ]
  }
}
```

#### 4. 更新個人資料

```http
PATCH /api/app/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "王小明",
  "phone": "0912-345-678"
}
```

---

### 社區 API (`/api/app/tenants`)

#### 1. 列出所有社區

```http
GET /api/app/tenants
Authorization: Bearer <token>
```

#### 2. 我加入的社區

```http
GET /api/app/tenants/my
Authorization: Bearer <token>
```

#### 3. 申請加入社區

```http
POST /api/app/tenants/:tenantId/join
Authorization: Bearer <token>
```

#### 4. 社區成員清單（管理員）

```http
GET /api/app/tenants/:tenantId/members
Authorization: Bearer <token>
```

#### 5. 待批准成員清單（管理員）

```http
GET /api/app/tenants/:tenantId/members/pending
Authorization: Bearer <token>
```

#### 6. 批准成員（管理員）

```http
PATCH /api/app/tenants/:tenantId/members/:memberId/approve
Authorization: Bearer <token>
```

#### 7. 拒絕成員（管理員）

```http
PATCH /api/app/tenants/:tenantId/members/:memberId/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "rejectionReason": "不符合條件"
}
```

#### 8. 設定成員角色（管理員）

```http
PATCH /api/app/tenants/:tenantId/members/:memberId/set-role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "ADMIN"
}
```

---

### 長輩 API (`/api/app/elders`)

#### 1. 列出長輩

```http
GET /api/app/elders?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "name": "陳阿公",
      "phone": "0912-555-666",
      "status": "ACTIVE",
      "lastActivityAt": "2026-01-16T...",
      "device": {
        "macAddress": "AA:BB:CC:DD:EE:01",
        "batteryLevel": 85
      },
      "tenant": {
        "id": "...",
        "name": "大愛社區"
      }
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

#### 2. 長輩詳情

```http
GET /api/app/elders/:id
Authorization: Bearer <token>
```

#### 3. 長輩行蹤記錄

```http
GET /api/app/elders/:id/locations?startDate=2026-01-16T00:00:00Z&endDate=2026-01-16T23:59:59Z&page=1&limit=50
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` - 開始時間（ISO 8601 格式）
- `endDate` - 結束時間（ISO 8601 格式）
- `page` - 頁碼（預設 1）
- `limit` - 每頁數量（預設 50）

---

### 警報 API (`/api/app/alerts`)

#### 1. 我的警報清單

```http
GET /api/app/alerts?status=PENDING
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` - 過濾狀態（PENDING, NOTIFIED, RESOLVED, DISMISSED）

#### 2. 所有警報（管理員）

```http
GET /api/app/alerts/all?tenantId=xxx&status=PENDING
Authorization: Bearer <token>
```

#### 3. 警報詳情

```http
GET /api/app/alerts/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "id": "...",
    "type": "BOUNDARY",
    "status": "PENDING",
    "severity": "HIGH",
    "title": "邊界警報",
    "message": "陳阿公 出現在邊界點",
    "triggeredAt": "2026-01-16T...",
    "acceptedBy": null,
    "elder": {
      "id": "...",
      "name": "陳阿公",
      "phone": "0912-555-666",
      "emergencyContact": "陳小明（兒子）",
      "emergencyPhone": "0912-777-888"
    },
    "assignments": [
      {
        "id": "...",
        "appUserId": "...",
        "isAccepted": false,
        "appUser": {
          "name": "王小明",
          "email": "user1@app.com"
        }
      }
    ]
  }
}
```

#### 4. 接受警報（接單）

```http
POST /api/app/alerts/:id/accept
Authorization: Bearer <token>
```

**說明：**
- 檢查用戶是否被分配此警報
- 檢查警報是否已被其他人接單
- 更新警報狀態為 NOTIFIED
- 設定 acceptedBy 為當前用戶

**錯誤：**
- `403` - 未被分配處理此警報
- `409` - 已被其他人接單

#### 5. 更新警報狀態

```http
PATCH /api/app/alerts/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "NOTIFIED",
  "resolution": "正在處理中"
}
```

**狀態：**
- `PENDING` - 待處理
- `NOTIFIED` - 處理中
- `RESOLVED` - 已完成
- `DISMISSED` - 已忽略

**權限：**
- 只有接單者或管理員可以更新狀態

#### 6. 分配警報（管理員）

```http
POST /api/app/alerts/:id/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "appUserIds": ["user1", "user2", "user3"]
}
```

**說明：**
- 只有管理員可以分配
- 可以同時分配給多個成員
- 會刪除舊的分配記錄

---

### 推送通知 API (`/api/app/push`)

#### 1. 註冊推送 Token

```http
POST /api/app/push/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "deviceInfo": {
    "brand": "Apple",
    "model": "iPhone 15",
    "osVersion": "iOS 17.2"
  }
}
```

#### 2. 移除推送 Token

```http
DELETE /api/app/push/token/:token
Authorization: Bearer <token>
```

---

## 🔐 認證機制

### JWT Token

App 使用獨立的 JWT 認證，與後台分開：

- **Secret Key**: `JWT_APP_SECRET`（環境變數）
- **過期時間**: 7 天
- **Payload**: `{ sub: userId, email: userEmail }`

### Token 使用

```typescript
// Request Header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 刷新機制

Token 過期後需要重新登入。建議：
- 在 API 回應 401 時自動導航到登入頁
- Token 有效期內可使用 `/api/app/auth/me` 刷新用戶資料

---

## 🎯 權限控制

### 一般成員（MEMBER）
- ✅ 查看所屬社區的長輩
- ✅ 查看分配給自己的警報
- ✅ 接受警報（接單）
- ✅ 更新自己接單的警報狀態
- ✅ 查看行蹤記錄
- ❌ 批准新成員
- ❌ 分配警報
- ❌ 新增長輩

### 社區管理員（ADMIN）
- ✅ 一般成員的所有權限
- ✅ 批准/拒絕新成員
- ✅ 設定成員角色
- ✅ 查看所有警報（不只分配給自己的）
- ✅ 分配警報給成員
- ✅ 新增長輩（預留）
- ✅ 強制更新任何警報狀態

---

## 📈 資料流程

### 警報接單流程

```
1. 警報產生（由後台系統自動觸發）
   └─> Alert { status: PENDING, acceptedBy: null }

2. 管理員分配警報
   └─> POST /api/app/alerts/:id/assign { appUserIds: ["user1", "user2"] }
   └─> 創建 AlertAssignment 記錄
   └─> 發送推送通知給 user1 和 user2

3. user1 查看警報
   └─> GET /api/app/alerts
   └─> 返回分配給 user1 的警報

4. user1 接受警報
   └─> POST /api/app/alerts/:id/accept
   └─> Alert { status: NOTIFIED, acceptedBy: "user1" }
   └─> AlertAssignment { isAccepted: true }
   └─> 通知其他成員（user2）

5. user2 嘗試接受
   └─> POST /api/app/alerts/:id/accept
   └─> 返回 409 錯誤：已被其他人接單

6. user1 更新狀態
   └─> PATCH /api/app/alerts/:id/status { status: "RESOLVED" }
   └─> Alert { status: RESOLVED, resolvedBy: "user1" }
```

### 設備管理流程

```
1. 採購入庫（後台）
   └─> POST /api/devices
   └─> Device { tenantId: null, elderId: null }

2. 分配給社區（後台）
   └─> POST /api/tenants/:id/devices/assign { deviceIds: [...] }
   └─> Device { tenantId: "tenant1", elderId: null }

3. 綁定給長輩（後台或 App）
   └─> POST /api/elders { deviceId: "dev1" }
   └─> Device { tenantId: "tenant1", elderId: "elder1" }
```

---

## 🧪 測試範例

### Postman Collection

```json
{
  "info": {
    "name": "Safe-Net Mobile App API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "App Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"name\": \"測試用戶\",\n  \"password\": \"password123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/app/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["app", "auth", "register"]
            }
          }
        }
      ]
    }
  ]
}
```

### curl 測試範例

```bash
# 1. 註冊
curl -X POST http://localhost:3001/api/app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "測試用戶",
    "password": "password123"
  }'

# 2. 登入（保存返回的 token）
TOKEN=$(curl -X POST http://localhost:3001/api/app/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@app.com",
    "password": "password123"
  }' | jq -r '.data.access_token')

# 3. 取得個人資料
curl http://localhost:3001/api/app/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 4. 列出長輩
curl http://localhost:3001/api/app/elders \
  -H "Authorization: Bearer $TOKEN"

# 5. 查看警報
curl http://localhost:3001/api/app/alerts \
  -H "Authorization: Bearer $TOKEN"

# 6. 接受警報
curl -X POST http://localhost:3001/api/app/alerts/<alert_id>/accept \
  -H "Authorization: Bearer $TOKEN"

# 7. 更新警報狀態
curl -X PATCH http://localhost:3001/api/app/alerts/<alert_id>/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "RESOLVED"}'
```

---

## 🔄 錯誤處理

### HTTP 狀態碼

- `200` - 成功
- `201` - 創建成功
- `400` - 請求參數錯誤
- `401` - 未認證或 Token 過期
- `403` - 權限不足
- `404` - 資源不存在
- `409` - 衝突（如重複註冊、已被接單等）
- `500` - 伺服器錯誤

### 錯誤回應格式

```json
{
  "statusCode": 409,
  "message": "此警報已被其他人接單",
  "error": "Conflict",
  "timestamp": "2026-01-16T..."
}
```

### App 端錯誤處理

```typescript
try {
  await alertsApi.acceptAlert(id);
} catch (error: any) {
  if (error.response?.status === 409) {
    Alert.alert('提示', '此警報已被其他人接單');
  } else if (error.response?.status === 403) {
    Alert.alert('錯誤', '您沒有權限執行此操作');
  } else {
    Alert.alert('錯誤', error.response?.data?.message || '操作失敗');
  }
}
```

---

## 🔔 推送通知

### Token 註冊流程

1. App 啟動時請求通知權限
2. 獲取 Expo Push Token
3. 調用 `/api/app/push/register` 註冊 Token
4. 後端保存 Token 到 `push_tokens` 表

### 推送通知場景

1. **新警報分配**
   - 管理員分配警報給成員
   - 所有被分配的成員收到推送

2. **警報被接單**
   - 某成員接受警報
   - 其他被分配的成員收到"已被接單"通知

3. **警報狀態更新**
   - 警報狀態改變
   - 相關成員收到更新通知

### Payload 格式

```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "sound": "default",
  "title": "BOUNDARY 警報",
  "body": "陳阿公 - 出現在邊界點",
  "data": {
    "alertId": "...",
    "type": "alert"
  }
}
```

---

## 💡 最佳實踐

### 1. Token 管理

```typescript
// 在 API client 中自動添加 token
axios.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 處理 401 錯誤（token 過期）
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.clear();
      // 導航到登入頁
    }
    return Promise.reject(error);
  }
);
```

### 2. 資料刷新

```typescript
// 使用 React Query 自動管理快取
const { data, refetch } = useQuery({
  queryKey: ['elders'],
  queryFn: () => eldersApi.getAll(),
  staleTime: 5 * 60 * 1000, // 5 分鐘內不重新請求
});

// 手動刷新
<RefreshControl
  refreshing={refreshing}
  onRefresh={() => refetch()}
/>
```

### 3. 錯誤處理

```typescript
// 統一的錯誤處理
const handleApiError = (error: any) => {
  const message = error.response?.data?.message || '操作失敗';
  const status = error.response?.status;
  
  if (status === 401) {
    // Token 過期，導航到登入
    navigation.navigate('Login');
  } else if (status === 403) {
    Alert.alert('權限不足', message);
  } else {
    Alert.alert('錯誤', message);
  }
};
```

---

## 📚 相關文檔

- `MOBILE_APP_IMPLEMENTATION_COMPLETE.md` - 完整實作文檔
- `MOBILE_APP_QUICK_START.md` - 快速啟動指南
- `COMPLETE_API_REFERENCE.md` - 後台 API 參考
- `DATABASE_SETUP_COMPLETE.md` - 資料庫文檔

---

**最後更新**: 2026-01-16  
**API 版本**: 1.0.0
