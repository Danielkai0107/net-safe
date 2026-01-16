# App 端問題修復總結

## 修復日期
2026-01-16

---

## 問題 1：後台新增成員功能 ✅ 已完成

### 需求
- 後台管理員可以直接將 App 用戶添加到社區
- 一個用戶可以加入多個社區
- 可以設定成員角色（一般成員 / 管理員）
- 可以移除成員

### 已實現功能

#### 後端 API
1. **POST `/tenants/:tenantId/members/add`** - 添加成員
2. **DELETE `/tenants/:tenantId/members/:memberId`** - 移除成員
3. **GET `/app-users/selection/available`** - 獲取可用用戶列表

#### 前端功能
- `AppMembersModal.tsx` 新增：
  - 「新增成員」按鈕
  - 用戶選擇下拉框
  - 角色選擇（一般成員/管理員）
  - 移除成員按鈕（垃圾桶圖標）

---

## 問題 2：App 用戶刪除功能 ✅ 已完成

### 狀態
功能已存在且正常運作

### 實現位置
- 前端：`apps/admin/src/pages/AppUsersPage.tsx`
- 後端：`DELETE /app-users/:id`
- 權限：僅 SUPER_ADMIN 可刪除

---

## 問題 3：社區成員設為管理員 ✅ 已完成

### 新增 API
- **PATCH `/tenants/:tenantId/members/:memberId/set-role`**

### 功能
- 批准的成員可切換角色（一般成員 ↔ 管理員）
- 前端已有完整 UI

---

## 問題 4：App 端 - 登入後 Token 失效 🔍 正在調查

### 問題描述
用戶登入成功後，Token 被保存，但後續請求返回 401 錯誤。

### 日誌分析
```
✅ 登入成功：Token saved successfully
❌ 請求失敗：Request failed with status code 401 (帶 token)
❌ Token 被清除：Response interceptor 清空 storage
❌ 後續請求：沒有 token
```

### 錯誤來源
```
Exception caught: UnauthorizedException: Unauthorized
at JwtStrategy.authenticate
at JwtStrategy.strategy.fail
```

### 可能原因
1. ✅ **JWT Secret 配置問題** - 需驗證前後端使用相同的 secret
2. ✅ **Token 簽名驗證失敗** - 加密算法或 secret 不匹配
3. ⚠️ **Token 格式問題** - Payload 結構可能不正確
4. ⚠️ **用戶查詢失敗** - 數據庫中找不到用戶

### 調試步驟

#### 1. 檢查環境變量
```bash
# 後端 .env 文件
JWT_APP_SECRET=your-secret-key

# 確保與代碼中的默認值一致
# 代碼默認：'app-secret-key-change-in-production'
```

#### 2. 檢查 Token 生成
```typescript
// apps/backend/src/app-auth/app-auth.service.ts
const payload = { sub: user.id, email: user.email };
const access_token = this.jwtService.sign(payload, {
  secret: process.env.JWT_APP_SECRET || 'app-secret-key-change-in-production',
  expiresIn: '7d',
});
```

#### 3. 檢查 Token 驗證
```typescript
// apps/backend/src/app-auth/strategies/jwt-app.strategy.ts
super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: process.env.JWT_APP_SECRET || 'app-secret-key-change-in-production',
});
```

#### 4. 新增調試日誌
已在 `jwt-app.strategy.ts` 中添加詳細日誌：
- 記錄 payload 內容
- 記錄用戶查詢結果
- 記錄 token 過期時間

### 測試方法

#### 方法 1：查看後端日誌
```bash
tail -f /Users/danielkai/.cursor/projects/Users-danielkai-Desktop-safe-net/terminals/24.txt
```

登入 App 後，查看日誌中的：
- `[JwtAppStrategy] Validating payload` - Token payload
- `[JwtAppStrategy] User found` - 用戶查詢結果

#### 方法 2：手動測試 API
```bash
# 1. 登入獲取 token
curl -X POST http://localhost:3001/api/app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 2. 使用 token 訪問受保護的端點
curl http://localhost:3001/api/app/elders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 解決方案（待驗證）

#### 方案 1：確保 Secret 一致
確保 `.env` 文件中設定了 `JWT_APP_SECRET`，且與代碼中的默認值一致。

#### 方案 2：檢查 Token 格式
確保 App 端正確保存和讀取 token：
- 保存：`await AsyncStorage.setItem(TOKEN_KEY, token)`
- 讀取：`await AsyncStorage.getItem(TOKEN_KEY)`
- 使用：`Authorization: Bearer ${token}`

#### 方案 3：修復 Response Interceptor
當前的 interceptor 過於激進，任何 401 都會清除 storage：

```typescript
// apps/mobile/src/api/client.ts
async (error) => {
  if (error.response?.status === 401) {
    // 只在確認 token 過期時清除
    // 不要清除正在登入過程中的 token
    await storage.clear();
  }
  return Promise.reject(error);
}
```

應改為：
```typescript
async (error) => {
  if (error.response?.status === 401 && error.config.url !== '/app/auth/login') {
    // Token 過期，清除本地資料
    await storage.clear();
  }
  return Promise.reject(error);
}
```

---

## 問題 5：App 端 - 加入社區後沒反應 ⏸️ 待驗證

### 相關問題
此問題可能是由於問題 4（Token 失效）導致的。

### 流程檢查

#### 1. 後台添加成員
✅ 後台可以將用戶添加到社區（問題 1 已修復）

#### 2. App 端查詢我的社區
```typescript
// apps/mobile/src/api/tenants.ts
async getMyTenants() {
  return apiClient.get('/app/tenants/my');
}

// 後端 API
@Get('my')
@UseGuards(JwtAppAuthGuard)
async getMyTenants(@Request() req) {
  const tenants = await this.appTenantsService.getMyTenants(req.user.userId);
  return { data: tenants };
}
```

#### 3. 問題分析
如果 Token 無效（問題 4），則：
- `/app/tenants/my` 返回 401
- 用戶看不到已加入的社區
- 長輩列表、警報列表都會是空的

### 解決順序
1. 先修復問題 4（Token 驗證）
2. 然後驗證問題 5 是否自動解決

---

## 問題 6：UI 改進 ✅ 已完成

### 修復內容

#### 1. ProfileScreen - 缺少 Chip import
```typescript
import { Chip } from 'react-native-paper';
```

#### 2. JoinTenantScreen - 改進空狀態提示
- 區分「載入中」和「沒有社區」
- 區分「搜尋無結果」和「確實沒有社區」
- 添加提示文字

---

## 下一步行動

### 立即執行
1. **查看後端日誌**
   ```bash
   tail -f ~/.cursor/projects/Users-danielkai-Desktop-safe-net/terminals/24.txt
   ```
   在 App 登入後，檢查 `[JwtAppStrategy]` 的日誌輸出

2. **驗證環境變量**
   ```bash
   cd /Users/danielkai/Desktop/safe-net/apps/backend
   cat .env | grep JWT_APP_SECRET
   ```

3. **測試場景**
   - 後台添加用戶到社區
   - App 端登入該用戶
   - 查看是否能看到社區
   - 查看日誌中的錯誤信息

### 預期結果
修復 Token 驗證問題後：
- ✅ 用戶登入成功
- ✅ 可以查看已加入的社區
- ✅ 可以查看長輩列表
- ✅ 可以查看警報列表

---

## 技術細節

### API 結構
```
後台管理系統 API：/api/*
├─ /tenants/:id/app-members（獲取成員）
├─ /tenants/:id/members/add（添加成員）
└─ /tenants/:id/members/:id（移除成員）

App 端 API：/api/app/*
├─ /app/auth/login（登入）
├─ /app/tenants/my（我的社區）
├─ /app/elders（長輩列表）
└─ /app/alerts（警報列表）
```

### 數據庫結構
```prisma
model TenantMember {
  id            String @id @default(cuid())
  tenantId      String
  appUserId     String
  role          TenantMemberRole @default(MEMBER)
  status        MembershipStatus @default(PENDING)
  requestedAt   DateTime @default(now())
  processedAt   DateTime?
  processedBy   String?
  processedByType String?  // 'backend' | 'app'
  
  @@unique([tenantId, appUserId])
}
```

### 成員狀態流程
```
1. 後台直接添加：
   PENDING → (自動) → APPROVED (processedByType: 'backend')

2. App 申請加入：
   PENDING → (管理員批准) → APPROVED (processedByType: 'app')

3. 移除成員：
   APPROVED → (刪除記錄)
```

---

## 文件清單

### 已修改文件
- `apps/backend/src/tenants/tenants.service.ts`
- `apps/backend/src/tenants/tenants.controller.ts`
- `apps/backend/src/tenants/dto/add-member.dto.ts` (新建)
- `apps/backend/src/app-users/app-users.controller.ts`
- `apps/backend/src/app-users/app-users.service.ts`
- `apps/admin/src/services/appUserService.ts`
- `apps/admin/src/services/tenantService.ts`
- `apps/admin/src/components/AppMembersModal.tsx`
- `apps/mobile/src/screens/profile/ProfileScreen.tsx`
- `apps/mobile/src/screens/profile/JoinTenantScreen.tsx`
- `apps/backend/src/app-auth/strategies/jwt-app.strategy.ts`

### 文檔文件
- `BACKEND_FRONTEND_FIXES.md` - 後台前端修復詳情
- `QUICK_TEST_GUIDE.md` - 測試指南
- `APP_FIXES_SUMMARY.md` - 本文檔

---

## 聯繫與支持

如果遇到問題，請提供：
1. 完整的錯誤訊息
2. 後端日誌（特別是 `[JwtAppStrategy]` 相關）
3. 重現步驟
4. 環境變量配置（不要包含敏感信息）
