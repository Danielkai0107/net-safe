# React 後台 CRUD 功能實作指南

**狀態**: ✅ Elder 已完成，其他可參考實作

---

## ✅ 已實作完整 CRUD

### Elder (長者管理)
**完成功能**:
- ✅ 新增長者（Modal + 表單）
- ✅ 編輯長者（預填表單）
- ✅ 刪除長者（確認對話框）
- ✅ 表單驗證（必填欄位）
- ✅ 下拉選單（選擇社區）
- ✅ 多欄位輸入
- ✅ 成功/失敗提示

**使用方式**:
1. 點擊「新增長者」→ 打開表單 Modal
2. 填寫資料 → 送出 → API 調用
3. 點擊卡片上的「編輯」→ 預填資料 → 更新
4. 點擊「刪除」→ 確認對話框 → 刪除

---

## 📝 實作模式（參考 Elder）

### State Management
```typescript
const [showModal, setShowModal] = useState(false);
const [editingItem, setEditingItem] = useState<Type | null>(null);
const [deletingItem, setDeletingItem] = useState<Type | null>(null);

const { register, handleSubmit, reset, formState: { errors } } = useForm();
```

### 新增功能
```typescript
const handleCreate = () => {
  setEditingItem(null);  // 清空編輯狀態
  reset({});              // 重置表單
  setShowModal(true);     // 打開 Modal
};
```

### 編輯功能
```typescript
const handleEdit = (item: Type) => {
  setEditingItem(item);   // 設定編輯對象
  reset(item);            // 預填表單
  setShowModal(true);     // 打開 Modal
};
```

### 刪除功能
```typescript
const handleDelete = async () => {
  if (!deletingItem) return;
  
  try {
    await service.delete(deletingItem.id);
    alert('刪除成功');
    loadItems();  // 重新載入列表
  } catch (error: any) {
    alert(error.response?.data?.message || '刪除失敗');
  }
};
```

### 表單送出
```typescript
const onSubmit = async (data: Partial<Type>) => {
  try {
    if (editingItem) {
      await service.update(editingItem.id, data);  // 更新
      alert('更新成功');
    } else {
      await service.create(data);                  // 新增
      alert('新增成功');
    }
    setShowModal(false);  // 關閉 Modal
    loadItems();          // 重新載入列表
  } catch (error: any) {
    alert(error.response?.data?.message || '操作失敗');
  }
};
```

---

## 🔨 快速實作其他頁面

### Device 頁面 CRUD
參考 Elder 頁面，需要的表單欄位：
```typescript
- elderId: 選擇長者（下拉選單）
- macAddress: MAC Address（必填）
- uuid: iBeacon UUID
- major: iBeacon Major
- minor: iBeacon Minor
- deviceName: 設備名稱
- type: 設備類型（下拉選單）
- batteryLevel: 電量（0-100）
```

### Gateway 頁面 CRUD
需要的表單欄位：
```typescript
- tenantId: 選擇社區（下拉選單）
- serialNumber: 序列號（必填）
- name: 名稱（必填）
- location: 位置描述
- type: 類型（GENERAL/BOUNDARY/MOBILE）
- latitude: 緯度（固定式）
- longitude: 經度（固定式）
```

### Tenant 頁面 CRUD
需要的表單欄位：
```typescript
- code: 社區代碼（必填，唯一）
- name: 名稱（必填）
- address: 地址
- contactPerson: 聯絡人
- contactPhone: 聯絡電話
- lineNotifyToken: LINE Token
```

---

## 📋 實作步驟

### 步驟 1: 添加 State
```typescript
const [showModal, setShowModal] = useState(false);
const [editingItem, setEditingItem] = useState<Type | null>(null);
const [deletingItem, setDeletingItem] = useState<Type | null>(null);
const { register, handleSubmit, reset, formState: { errors } } = useForm();
```

### 步驟 2: 添加處理函數
```typescript
const handleCreate = () => { ... };
const handleEdit = (item) => { ... };
const handleDelete = async () => { ... };
const onSubmit = async (data) => { ... };
```

### 步驟 3: 更新按鈕
```typescript
<button onClick={handleCreate}>新增</button>
<button onClick={() => handleEdit(item)}>編輯</button>
<button onClick={() => setDeletingItem(item)}>刪除</button>
```

### 步驟 4: 添加 Modal
```typescript
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title={editingItem ? '編輯' : '新增'}
>
  <form onSubmit={handleSubmit(onSubmit)}>
    {/* 表單欄位 */}
  </form>
</Modal>
```

### 步驟 5: 添加確認對話框
```typescript
<ConfirmDialog
  isOpen={!!deletingItem}
  onClose={() => setDeletingItem(null)}
  onConfirm={handleDelete}
  title="確認刪除"
  message={`確定要刪除「${deletingItem?.name}」嗎？`}
/>
```

---

## 🎯 目前狀態

### ✅ 完整 CRUD
- Elder (長者管理)

### ⏳ 需要添加 CRUD
- Tenant (社區管理) - 參考 Elder 模式
- Device (設備管理) - 參考 Elder 模式
- Gateway (接收點管理) - 參考 Elder 模式

### ✅ 特殊功能
- Alert (警報管理) - 已有解決/忽略功能

---

## 💡 提示

### 表單驗證
使用 React Hook Form 的 `register` 選項：
```typescript
{...register('fieldName', { 
  required: '此欄位為必填',
  minLength: { value: 3, message: '至少 3 個字元' },
  pattern: { value: /regex/, message: '格式不正確' }
})}
```

### 錯誤顯示
```typescript
{errors.fieldName && (
  <p className="text-sm text-red-600 mt-1">
    {errors.fieldName.message}
  </p>
)}
```

### 載入狀態
```typescript
const [submitting, setSubmitting] = useState(false);

<button disabled={submitting} className="btn-primary">
  {submitting ? '處理中...' : '送出'}
</button>
```

---

## 📚 相關組件

### 已建立的共用組件
- `Modal.tsx` - 對話框組件
- `ConfirmDialog.tsx` - 確認對話框
- `ProtectedRoute.tsx` - 受保護路由

### 可以添加的組件
- `FormField.tsx` - 表單欄位包裝
- `LoadingSpinner.tsx` - 載入動畫
- `Toast.tsx` - 吐司通知（取代 alert）
- `Table.tsx` - 表格組件包裝

---

**完成時間**: 2026-01-15  
**狀態**: Elder CRUD 已完成，其他可快速參考實作
