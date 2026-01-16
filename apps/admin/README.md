# Safe-Net Admin Dashboard

**社區守護者後台管理系統**

React + TypeScript + Vite + TailwindCSS

---

## 🚀 快速開始

### 1. 確保後端 API 已啟動
```bash
# 在另一個終端
cd apps/backend
pnpm dev
# API 運行在 http://localhost:3001/api
```

### 2. 啟動前端
```bash
cd apps/admin
pnpm dev
# 前端運行在 http://localhost:3000
```

### 3. 登入測試
訪問: http://localhost:3000

**測試帳號**:
- Super Admin: `admin@safenet.com` / `admin123456`
- 社區管理員: `admin@dalove.com` / `admin123`

---

## 📚 已實作功能

### ✅ 核心功能
- [x] 登入/登出
- [x] JWT Token 管理
- [x] 受保護路由
- [x] Dashboard 總覽（統計數據）
- [x] 社區列表
- [x] 長者列表（卡片式）

### ⏳ 開發中
- [ ] Device 管理頁面
- [ ] Gateway 管理頁面
- [ ] Alert 管理頁面
- [ ] CRUD 表單（新增/編輯）
- [ ] 詳情頁面
- [ ] 圖表視覺化

---

## 🎨 技術棧

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS 4
- **Routing**: React Router DOM 7
- **State**: Zustand 5
- **HTTP**: Axios
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Date**: date-fns

---

## 📂 專案結構

```
src/
├── components/           # 共用組件
│   └── ProtectedRoute.tsx
├── layouts/             # 佈局組件
│   └── DashboardLayout.tsx
├── pages/               # 頁面組件
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── TenantsPage.tsx
│   └── EldersPage.tsx
├── services/            # API Services
│   ├── api.ts          # Axios 實例
│   ├── authService.ts
│   ├── tenantService.ts
│   ├── elderService.ts
│   └── dashboardService.ts
├── store/               # Zustand Stores
│   └── authStore.ts
├── types/               # TypeScript 類型
│   └── index.ts
├── App.tsx              # 路由配置
├── main.tsx             # 入口文件
└── index.css            # 全域樣式
```

---

## 🔐 認證流程

1. 用戶輸入 email/password
2. 調用 `POST /api/auth/login`
3. 儲存 token 和用戶資料到 localStorage
4. Zustand store 更新狀態
5. axios interceptor 自動添加 token
6. 401 錯誤自動登出並跳轉登入頁

---

## 🎨 UI 特色

### TailwindCSS 自訂類別
- `btn-primary`: 主要按鈕
- `btn-secondary`: 次要按鈕
- `card`: 卡片容器
- `input`: 輸入框
- `label`: 標籤

### 響應式設計
- 完整的 mobile/tablet/desktop 支援
- Grid 系統自動調整
- 側邊欄固定式設計

---

## 📝 待完成頁面

你可以按照已有的模式快速添加：

### Device 管理
參考 `TenantsPage.tsx`，實作：
- 設備列表（表格式）
- MAC Address 顯示
- 電量狀態
- CRUD 操作

### Gateway 管理
參考 `TenantsPage.tsx`，實作：
- 接收點列表
- 類型標籤（GENERAL/BOUNDARY/MOBILE）
- GPS 座標顯示
- CRUD 操作

### Alert 管理
實作：
- 警報列表（含過濾）
- 狀態標籤
- 解決/忽略按鈕
- 詳情對話框

---

## 🌐 環境變數

建立 `.env` 檔案：
```env
VITE_API_URL=http://localhost:3001/api
```

---

## 🐛 常見問題

### Q: 無法連接 API？
確保後端 API 在 http://localhost:3001/api 運行

### Q: 登入失敗？
檢查：
1. 後端 API 是否運行
2. 資料庫是否已 seed
3. CORS 是否正確配置

### Q: Token 過期？
Token 有效期 7 天，過期後會自動登出

---

**狀態**: ✅ 核心功能完成，可開始使用
