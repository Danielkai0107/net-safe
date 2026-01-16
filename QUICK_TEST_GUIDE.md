# 快速測試指南

## 修復內容
1. ✅ App 用戶刪除功能（已存在）
2. ✅ 社區成員設為管理員功能（已修復）

---

## 測試步驟

### 1. 啟動服務

如果服務未運行，請啟動：

```bash
cd /Users/danielkai/Desktop/safe-net
pnpm dev
```

等待所有服務啟動完成。

### 2. 測試 App 用戶刪除

1. 打開瀏覽器訪問：`http://localhost:5173`
2. 使用 SUPER_ADMIN 帳號登入
3. 點擊左側菜單「App 用戶管理」
4. 找到任一測試用戶，點擊右側的刪除按鈕（垃圾桶圖標）
5. 確認刪除對話框
6. **預期結果**：用戶從列表中消失，顯示「刪除成功」

### 3. 測試設為管理員功能

1. 在後台管理系統中，點擊左側菜單「社區管理」
2. 找到任一社區，點擊「管理」欄位中的人員圖標（App 成員管理）
3. 在彈出的 Modal 中，找到狀態為「已批准」的成員
4. 點擊該成員右側的「設為管理員」按鈕
5. 確認操作
6. **預期結果**：
   - 顯示「已設為管理員」訊息
   - 成員角色標籤變為「管理員」（藍色）
   - 按鈕文字變為「取消管理員」

### 4. 測試取消管理員

1. 在同一個 Modal 中，點擊剛才設為管理員的成員
2. 點擊「取消管理員」按鈕
3. 確認操作
4. **預期結果**：
   - 顯示「已取消管理員」訊息
   - 成員角色標籤變為「一般成員」（灰色）
   - 按鈕文字變為「設為管理員」

---

## 檢查後端日誌

如果遇到問題，查看後端日誌：

```bash
# 查看實時日誌
tail -f /Users/danielkai/.cursor/projects/Users-danielkai-Desktop-safe-net/terminals/24.txt

# 或者查看最後 50 行
tail -50 /Users/danielkai/.cursor/projects/Users-danielkai-Desktop-safe-net/terminals/24.txt
```

---

## 常見問題

### Q1: 刪除按鈕不可見
**A**: 確認您使用的是 SUPER_ADMIN 帳號登入。只有 SUPER_ADMIN 可以刪除用戶。

### Q2: 設為管理員按鈕不可見
**A**: 確認成員狀態為「已批准」。只有已批准的成員才能設為管理員。

### Q3: API 回應 404
**A**: 後端服務可能未正確啟動或熱重載失敗。請重啟後端服務：
```bash
# 終止當前服務
Ctrl + C

# 重新啟動
pnpm dev
```

### Q4: "名單抓錯"的問題
**A**: 請提供具體現象：
- 哪個社區？
- 顯示了哪些不應該出現的成員？
- 應該顯示哪些成員？

這樣才能進一步診斷問題所在。

---

## API 端點清單

### 新增的 API
- `PATCH /tenants/:tenantId/members/:memberId/set-role` - 設定成員角色

### 現有的 API
- `DELETE /app-users/:id` - 刪除 App 用戶
- `GET /tenants/:id/app-members` - 獲取社區成員列表
- `PATCH /tenants/:tenantId/members/:memberId/approve` - 批准成員
- `PATCH /tenants/:tenantId/members/:memberId/reject` - 拒絕成員

---

## 需要進一步協助？

如果測試過程中遇到問題，請提供：
1. 具體的錯誤訊息
2. 瀏覽器控制台錯誤（F12）
3. 後端日誌相關部分
4. 重現步驟

這樣可以更快速地診斷和解決問題。
