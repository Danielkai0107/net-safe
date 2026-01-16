# Safe-Net Mobile App 快速啟動指南

## 🚀 快速啟動（5 分鐘）

### 步驟 1: 啟動資料庫

```bash
cd /Users/danielkai/Desktop/safe-net
docker-compose up -d
```

### 步驟 2: 啟動後端 API

```bash
cd apps/backend
npm run start:dev
```

後端將在 `http://localhost:3001` 運行

### 步驟 3: 啟動 Mobile App

```bash
cd apps/mobile
npm start
```

然後：

- 按 `i` 啟動 iOS 模擬器
- 按 `a` 啟動 Android 模擬器
- 掃描 QR code 在實體設備上運行（使用 Expo Go）

---

## 🧪 測試流程

### 基本測試（認證與社區）

1. **註冊新帳號**

   - 打開 App，點擊"還沒有帳號？立即註冊"
   - 填寫：稱呼、Email、密碼、確認密碼
   - 註冊成功後自動登入

2. **使用現有帳號登入**

   ```
   Email: user1@app.com
   Password: password123
   （這是已批准的社區管理員帳號）
   ```

3. **查看長輩清單**

   - 登入後自動進入"追蹤清單"頁面
   - 應該看到 2 個長輩（陳阿公、林阿嬤）
   - 點擊長輩查看詳情和行蹤記錄

4. **加入新社區**
   - 切換到"個人"頁面
   - 點擊"加入社區"
   - 瀏覽可用社區並申請加入

### 警報測試（需要手動創建警報）

#### 方式 1: 使用後台創建警報

1. 登入後台 (`http://localhost:5173`)

   ```
   Email: admin@dalove.com
   Password: admin123
   ```

2. 手動在資料庫創建警報分配：

   ```sql
   -- 首先找到 alert ID 和 app user ID
   SELECT id FROM alerts ORDER BY "triggeredAt" DESC LIMIT 1;
   SELECT id FROM app_users WHERE email = 'user1@app.com';

   -- 創建警報分配
   INSERT INTO alert_assignments (id, "alertId", "appUserId", "isAccepted")
   VALUES (gen_random_uuid(), '<alert_id>', '<app_user_id>', false);
   ```

#### 方式 2: 使用 API 測試工具

```bash
# 獲取 token（使用 App 帳號登入）
curl -X POST http://localhost:3001/api/app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@app.com","password":"password123"}'

# 查看我的警報
curl http://localhost:3001/api/app/alerts \
  -H "Authorization: Bearer <token>"

# 接受警報
curl -X POST http://localhost:3001/api/app/alerts/<alert_id>/accept \
  -H "Authorization: Bearer <token>"
```

3. 在 App 中查看：
   - 切換到"緊急通知"頁面
   - 應該看到分配給你的警報
   - 點擊警報進入詳情
   - 點擊"接受警報"按鈕
   - 更新狀態為"處理中"或"已完成"

### 成員管理測試（管理員功能）

1. 使用 `user1@app.com` 登入（管理員帳號）

2. 在另一台設備或清除 App 資料後，使用 `user3@app.com` 登入並申請加入社區

3. 切換回 `user1@app.com`：
   - 進入"個人"頁面
   - 點擊"等待確認清單"
   - 應該看到 user3 的申請
   - 批准或拒絕申請

---

## 🔍 除錯指南

### 常見問題

#### 1. 後端無法啟動

```bash
# 檢查資料庫是否運行
docker ps

# 重新安裝依賴
cd apps/backend
npm install

# 重新生成 Prisma Client
cd ../../packages/database
npx prisma generate
```

#### 2. App 無法連接 API

- 確認後端正在運行：`http://localhost:3001/api`
- 檢查 `src/config.ts` 中的 API 網址
- iOS 模擬器：使用 `localhost`
- Android 模擬器：使用 `10.0.2.2`
- 實體設備：使用電腦的區域網路 IP

#### 3. 推送通知無法運行

- 推送通知只能在實體設備上測試
- 確認已在 `app.json` 設定 EAS Project ID
- 確認已安裝 expo-notifications、expo-device、expo-constants

#### 4. 認證失敗

```bash
# 檢查 JWT_APP_SECRET 環境變數
# 在 apps/backend/.env 中設定：
JWT_APP_SECRET=your-app-secret-key-here
```

---

## 📱 在實體設備上測試

### iOS

1. 從 App Store 安裝 Expo Go
2. 確保手機和電腦在同一個 WiFi 網路
3. 打開 Expo Go，掃描終端機中的 QR code

### Android

1. 從 Google Play 安裝 Expo Go
2. 確保手機和電腦在同一個 WiFi 網路
3. 打開 Expo Go，掃描終端機中的 QR code

### 推送通知測試（實體設備）

1. 在實體設備上運行 App
2. 登入帳號
3. App 會自動註冊推送 Token
4. 在後端觸發警報，檢查是否收到通知

---

## 🛠️ 開發工具

### API 測試

使用 Postman 或 curl 測試 API：

```bash
# 設定環境變數
export API_URL="http://localhost:3001/api"
export APP_TOKEN="<從登入取得的 token>"

# 測試 API
curl $API_URL/app/auth/me \
  -H "Authorization: Bearer $APP_TOKEN"
```

### 資料庫管理

```bash
cd packages/database
pnpm db:studio
```

在瀏覽器中打開 `http://localhost:5555` 查看資料庫

### 查看 Logs

```bash
# 後端 logs
cd apps/backend
npm run start:dev

# Mobile App logs
cd apps/mobile
npm start
# 按 'j' 打開開發者選單
```

---

## 📊 專案結構總覽

```
safe-net/
├── apps/
│   ├── admin/          # 後台管理（React）
│   ├── backend/        # 後端 API（NestJS）
│   │   └── src/
│   │       ├── app-auth/           # ✨ 新增
│   │       ├── app-tenants/        # ✨ 新增
│   │       ├── app-elders/         # ✨ 新增
│   │       ├── app-alerts/         # ✨ 新增
│   │       └── push-notifications/ # ✨ 新增
│   └── mobile/         # 手機 App（React Native + Expo） ✨ 新增
│       └── src/
│           ├── api/
│           ├── navigation/
│           ├── screens/
│           ├── stores/
│           └── utils/
├── packages/
│   ├── database/       # Prisma 資料庫
│   ├── shared-types/   # ✨ 新增
│   └── api-client/     # ✨ 新增
└── docker-compose.yml
```

---

## ✅ 檢查清單

在正式部署前，請確認以下項目：

- [ ] 資料庫遷移已執行
- [ ] Seed 資料已初始化
- [ ] 後端可以成功編譯
- [ ] 後端 API 可以正常訪問
- [ ] Mobile App 可以成功啟動
- [ ] 認證流程正常運作
- [ ] 可以查看長輩和警報資料
- [ ] JWT_APP_SECRET 已在生產環境設定
- [ ] Expo EAS Project ID 已設定（用於推送通知）
- [ ] API 網址已根據環境正確配置

---

**祝開發順利！** 🎉

如有任何問題，請參考：

- `MOBILE_APP_IMPLEMENTATION_COMPLETE.md` - 完整實作文檔
- `COMPLETE_API_REFERENCE.md` - API 參考文檔
- `DATABASE_SETUP_COMPLETE.md` - 資料庫文檔
