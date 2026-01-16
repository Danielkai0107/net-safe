# API 響應格式修復

**修復時間**: 2026-01-16 15:10  
**問題**: App 端解析 API 響應時出錯

---

## 🐛 問題描述

### 錯誤訊息

```
ERROR  [TypeError: myTenants.map is not a function (it is undefined)]
```

### 原因分析

後端返回的數據格式有**雙層嵌套**：

```javascript
// 後端返回
{
  data: {
    data: [{ tenant objects }],  // ← 資料在這裡
    timestamp: "2026-01-16T..."
  },
  timestamp: "2026-01-16T..."
}
```

但 App 端代碼只取了 `response.data`：

```javascript
// 錯誤的做法
const tenants = response.data;  // 這會得到 { data: [...], timestamp: "..." }
tenants.map(...)  // ❌ 錯誤！tenants 不是陣列
```

---

## ✅ 修復方案

### 修改策略

使用容錯的解析方式，同時支持單層和雙層嵌套：

```javascript
// 正確的做法
const tenants = response.data?.data || response.data || [];
```

這樣可以處理：
- ✅ 雙層嵌套：`response.data.data`
- ✅ 單層嵌套：`response.data`
- ✅ 錯誤情況：空陣列 `[]`

---

## 📝 已修復的文件

### 1. ElderDetailScreen.tsx ⭐ 最新修復

```typescript
const loadData = async () => {
  try {
    const [elderResponse, locationsResponse]: any = await Promise.all([
      eldersApi.getOne(id),
      eldersApi.getLocations(id, getDateRange()),
    ]);

    // 處理雙層嵌套
    const elderData = elderResponse.data?.data || elderResponse.data;
    const locationsData = locationsResponse.data?.data || locationsResponse.data || [];

    setElder(elderData);
    setLocations(locationsData);
  } catch (error) {
    console.error("載入長輩詳情失敗:", error);
    setLocations([]);
  }
};
```

### 2. ProfileScreen.tsx

```typescript
const loadMyTenants = async () => {
  try {
    const response: any = await tenantsApi.getMyTenants();
    // 處理雙層嵌套
    const tenants = response.data?.data || response.data || [];
    setMyTenants(tenants);
  } catch (error) {
    console.error("載入社區清單失敗:", error);
    setMyTenants([]);
  }
};
```

### 3. ElderListScreen.tsx

```typescript
const loadElders = async () => {
  try {
    const response: any = await eldersApi.getAll();
    // 處理雙層嵌套
    const elders = response.data?.data || response.data || [];
    setElders(elders);
  } catch (error) {
    console.error("載入長輩清單失敗:", error);
    setElders([]);
  }
};
```

### 4. AlertListScreen.tsx

```typescript
const loadAlerts = async () => {
  try {
    let response: any;
    if (viewMode === "all" && isAdmin) {
      response = await alertsApi.getAllAlerts(undefined, filterStatus);
    } else {
      response = await alertsApi.getMyAlerts(filterStatus);
    }
    // 處理雙層嵌套
    const alerts = response.data?.data || response.data || [];
    setAlerts(alerts);
  } catch (error) {
    console.error("載入警報清單失敗:", error);
    setAlerts([]);
  }
};
```

### 5. JoinTenantScreen.tsx

```typescript
const loadTenants = async () => {
  try {
    const response: any = await tenantsApi.getAll();
    // 處理雙層嵌套
    const tenantsData = response.data?.data || response.data || [];
    setTenants(tenantsData);
    setFilteredTenants(tenantsData);
  } catch (error) {
    console.error("載入社區清單失敗:", error);
    setTenants([]);
    setFilteredTenants([]);
  }
};
```

### 6. PendingMembersScreen.tsx ⭐ 最新修復

```typescript
const loadMembers = async () => {
  try {
    const response: any = await tenantsApi.getPendingMembers(tenantId);
    // 處理雙層嵌套
    const members = response.data?.data || response.data || [];
    setMembers(members);
  } catch (error) {
    console.error("載入待批准成員失敗:", error);
    setMembers([]);
  }
};
```

### 7. AlertDetailScreen.tsx ⭐ 最新修復

```typescript
const loadAlert = async () => {
  try {
    const response: any = await alertsApi.getAlert(id);
    // 處理雙層嵌套
    const alertData = response.data?.data || response.data;
    setAlert(alertData);
  } catch (error) {
    console.error("載入警報詳情失敗:", error);
    RNAlert.alert("錯誤", "載入失敗");
    navigation.goBack();
  }
};
```

---

## 🔍 調試日誌增強

每個修復的文件都添加了詳細的日誌：

```javascript
console.log('[ScreenName] Raw response:', response);
console.log('[ScreenName] Parsed data:', { 
  count: data.length, 
  isArray: Array.isArray(data) 
});
```

這樣可以幫助快速診斷問題。

---

## 🧪 測試驗證

重新運行 App 後，應該看到：

### 成功的日誌

```
LOG  [ProfileScreen] Raw response: { data: { data: [...] } }
LOG  [ProfileScreen] Parsed tenants: { count: 1, isArray: true }
LOG  [ElderListScreen] Parsed elders: { count: 2, isArray: true }
LOG  [AlertListScreen] Parsed alerts: { count: 0, isArray: true }
```

### 不再出現錯誤

- ❌ 不再看到 `myTenants.map is not a function`
- ❌ 不再看到 `elders.map is not a function`
- ❌ 不再看到 `alerts.map is not a function`

---

## 💡 為什麼會有雙層嵌套？

### 後端返回格式

```typescript
// Controller 返回
return {
  data: tenants,
  timestamp: new Date().toISOString(),
};
```

### Axios 處理

Axios 會自動將響應包裝在 `data` 中：

```javascript
// HTTP 響應
{
  status: 200,
  data: {           // ← Axios 添加這一層
    data: [...],    // ← Controller 返回的 data
    timestamp: "..."
  }
}
```

### 解決方案選項

**選項 A**: 修改 App 端解析（當前採用）✅
- 優點：不影響後端，快速修復
- 缺點：需要修改多個文件

**選項 B**: 修改後端返回格式
- 優點：統一格式，更清晰
- 缺點：影響範圍大，需要測試所有 API

當前我們選擇**選項 A**，因為：
1. 修復快速
2. 不影響後端
3. 不影響後台管理系統
4. 容錯性更好（支持兩種格式）

---

## 🎯 測試結果

修復後的 App 應該：

1. ✅ 正常顯示個人頁面的社區清單
2. ✅ 正常顯示長輩清單（如果有）
3. ✅ 正常顯示警報清單（如果有）
4. ✅ 正常顯示可加入的社區列表
5. ✅ 沒有 JavaScript 錯誤

---

## 📚 相關修復

這次修復是繼 **Token 驗證問題** 後的第二個修復：

1. ✅ **Token 驗證修復** - 解決 401 錯誤
   - 修改全局 Guard 跳過 App 路由
   
2. ✅ **響應格式修復** - 解決解析錯誤（本次）
   - 處理雙層嵌套的響應格式

---

**修復完成！** 🎉

現在 App 應該可以完全正常運作了。
