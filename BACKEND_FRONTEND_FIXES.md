# 後台前端修復報告

## 修復日期
2026-01-16

## 問題與修復

### 1. App 用戶管理 - 刪除功能 ✅

**狀態：已存在並正常運作**

#### 前端實現
文件：`apps/admin/src/pages/AppUsersPage.tsx`

- 第 206-211 行：刪除按鈕已存在
- 第 61-72 行：刪除處理函數已實現
- 第 303-311 行：確認對話框已實現

#### 後端實現
文件：`apps/backend/src/app-users/app-users.controller.ts`

- 第 66-75 行：刪除 API 端點 `DELETE /app-users/:id` 已實現
- 權限：僅 SUPER_ADMIN 可以刪除

#### 測試結果
從後端日誌可以看到成功的刪除操作：
```
DELETE FROM "public"."app_users" WHERE ("public"."app_users"."id" = $1 AND 1=1)
```

---

### 2. 社區管理 - App 成員管理設為管理員功能 ✅

**狀態：已修復**

#### 問題描述
前端調用了 `PATCH /tenants/:tenantId/members/:memberId/set-role` API，但後端沒有實現此端點。

#### 修復內容

##### 2.1 後端服務層
文件：`apps/backend/src/tenants/tenants.service.ts`

新增 `setMemberRole` 方法（第 272-296 行）：
```typescript
async setMemberRole(
  tenantId: string,
  memberId: string,
  role: 'MEMBER' | 'ADMIN',
): Promise<any> {
  const membership = await this.databaseService.tenantMember.findUnique({
    where: { id: memberId },
  });

  if (!membership || membership.tenantId !== tenantId) {
    throw new NotFoundException('Member not found');
  }

  if (membership.status !== 'APPROVED') {
    throw new ConflictException('Can only set role for approved members');
  }

  return this.databaseService.tenantMember.update({
    where: { id: memberId },
    data: { role },
    include: {
      appUser: {
        select: { id: true, email: true, name: true },
      },
    },
  });
}
```

##### 2.2 後端控制器
文件：`apps/backend/src/tenants/tenants.controller.ts`

新增 API 端點（第 114-131 行）：
```typescript
@Patch(':tenantId/members/:memberId/set-role')
@Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
async setMemberRole(
  @Param('tenantId') tenantId: string,
  @Param('memberId') memberId: string,
  @Body() setMemberRoleDto: SetMemberRoleDto,
): Promise<any> {
  const result = await this.tenantsService.setMemberRole(
    tenantId,
    memberId,
    setMemberRoleDto.role,
  );
  return {
    data: result,
    message: 'Member role updated successfully',
    timestamp: new Date().toISOString(),
  };
}
```

##### 2.3 DTO 驗證
文件：`apps/backend/src/tenants/dto/set-member-role.dto.ts`（新建）

```typescript
import { IsIn } from 'class-validator';

export class SetMemberRoleDto {
  @IsIn(['MEMBER', 'ADMIN'])
  role: 'MEMBER' | 'ADMIN';
}
```

#### 前端實現（已存在）
文件：`apps/admin/src/components/AppMembersModal.tsx`

- 第 60-73 行：切換管理員角色處理函數
- 第 195-207 行：管理員切換按鈕
- 前端調用 `tenantService.setMemberRole(tenantId, memberId, newRole)`

---

## API 端點總結

### App 用戶管理

| 方法 | 端點 | 權限 | 功能 |
|------|------|------|------|
| GET | `/app-users` | SUPER_ADMIN, TENANT_ADMIN | 獲取 App 用戶列表 |
| GET | `/app-users/:id` | SUPER_ADMIN, TENANT_ADMIN | 獲取單個用戶詳情 |
| PATCH | `/app-users/:id` | SUPER_ADMIN, TENANT_ADMIN | 更新用戶資料 |
| PATCH | `/app-users/:id/toggle-active` | SUPER_ADMIN, TENANT_ADMIN | 啟用/停用用戶 |
| DELETE | `/app-users/:id` | SUPER_ADMIN | **刪除用戶** |

### 社區成員管理

| 方法 | 端點 | 權限 | 功能 |
|------|------|------|------|
| GET | `/tenants/:id/app-members` | SUPER_ADMIN, TENANT_ADMIN | 獲取社區成員列表 |
| PATCH | `/tenants/:tenantId/members/:memberId/approve` | SUPER_ADMIN, TENANT_ADMIN | 批准成員加入 |
| PATCH | `/tenants/:tenantId/members/:memberId/reject` | SUPER_ADMIN, TENANT_ADMIN | 拒絕成員申請 |
| PATCH | `/tenants/:tenantId/members/:memberId/set-role` | SUPER_ADMIN, TENANT_ADMIN | **設定成員角色** ✨ 新增 |

---

## 測試建議

### 1. App 用戶刪除
1. 登入後台管理系統（SUPER_ADMIN 帳號）
2. 進入「App 用戶管理」頁面
3. 點擊任一用戶的刪除按鈕（垃圾桶圖標）
4. 確認刪除對話框
5. 驗證用戶已從列表中移除

### 2. 設定成員為管理員
1. 登入後台管理系統
2. 進入「社區管理」頁面
3. 點擊任一社區的「App 成員管理」按鈕（人員圖標）
4. 找到狀態為「已批准」的成員
5. 點擊「設為管理員」按鈕
6. 驗證成員角色變更為「管理員」
7. 再次點擊「取消管理員」按鈕
8. 驗證成員角色變更為「一般成員」

---

## 注意事項

### 資料庫級聯刪除
當刪除 App 用戶時，由於資料庫的 `onDelete: Cascade` 設定，相關的資料會自動刪除：
- TenantMember（社區成員關係）
- AlertAssignment（警報分配）
- PushToken（推送通知 Token）

### 權限控制
- **刪除用戶**：僅 SUPER_ADMIN 可以執行
- **成員管理**：SUPER_ADMIN 和 TENANT_ADMIN 都可以執行

### 狀態限制
- 只有狀態為 `APPROVED`（已批准）的成員才能設定角色
- 狀態為 `PENDING`（待批准）或 `REJECTED`（已拒絕）的成員無法設定角色

---

## 修復完成確認

✅ App 用戶刪除功能：已驗證存在且正常運作  
✅ 設定成員為管理員：後端 API 已補齊，前端功能完整  
✅ 代碼已編譯成功，無錯誤  
✅ 熱重載自動更新，無需手動重啟服務  

## "名單抓錯"問題檢查

關於"社區管理中 App 成員管理名單抓錯"的問題，已檢查：

### 後端查詢邏輯
文件：`apps/backend/src/tenants/tenants.service.ts` (第 172-194 行)

查詢條件：
```typescript
where: { tenantId },  // 正確：只查詢該社區的成員
include: {
  appUser: { ... }    // 正確：包含 App 用戶資料
},
orderBy: [{ status: 'asc' }, { createdAt: 'desc' }]
```

### 前端數據處理
文件：`apps/admin/src/components/AppMembersModal.tsx` (第 22-33 行)

```typescript
const response = await tenantService.getAppMembers(tenantId);
setMembers(response.data.data || []);
```

### Prisma Include 行為
Prisma 使用 `include` 時可能以兩種方式處理：
1. **JOIN 查詢**：直接 JOIN app_users 表
2. **N+1 查詢**：先查 tenant_members，再批次查詢 app_users

這兩種方式都是正確的，Prisma 會自動選擇最優策略。

### 如何驗證名單是否正確

1. **在管理後台測試**：
   - 登入後台 → 社區管理 → 點擊「App 成員管理」
   - 檢查顯示的成員是否屬於該社區
   - 檢查成員的 email、name、phone 等資訊是否完整

2. **查看後端日誌**：
   ```bash
   tail -f /Users/danielkai/.cursor/projects/Users-danielkai-Desktop-safe-net/terminals/24.txt
   ```
   然後在前端點擊「App 成員管理」，查看執行的 SQL 查詢

3. **直接測試 API**（需要登入 token）：
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:3001/api/tenants/TENANT_ID/app-members
   ```

### 可能的問題場景

如果名單確實抓錯，可能原因：
1. **前端傳錯 tenantId**：檢查 TenantsPage.tsx 第 145 行傳遞的 tenantId
2. **資料庫資料不正確**：TenantMember 表的 tenantId 欄位指向錯誤
3. **前端顯示邏輯錯誤**：AppMembersModal 顯示邏輯有問題

**建議操作**：請提供具體的錯誤現象（例如：「A 社區顯示了 B 社區的成員」），以便進一步診斷。

## 下次啟動說明

由於後端代碼已更新，如果您完全重啟了服務，新的 API 端點會自動載入。
前端代碼無需修改，已經完整支援這些功能。
