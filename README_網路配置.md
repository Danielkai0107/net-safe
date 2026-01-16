# 🌐 Safe-Net 網路配置說明

## 🎯 給遇到網路問題的您

如果您遇到**切換 WiFi 後前端無法連接後端**的問題，這份文件可以幫到您！

---

## ⚡ 快速解決（30 秒）

```bash
# 執行自動修復
pnpm update-ip

# 重啟前端服務（如果正在運行）
# Admin: cd apps/admin && pnpm dev
# Mobile: cd apps/mobile && pnpm android
```

✅ 完成！

---

## 📚 完整文件索引

### 1. 🔥 [快速修復指南](./QUICK_FIX_NETWORK.md)
- **適合**：立即需要解決問題
- **內容**：最快的修復步驟
- **閱讀時間**：1 分鐘

### 2. 🎯 [終極解決方案](./網路問題終極解決方案.md)
- **適合**：想要徹底解決問題
- **內容**：問題原理 + 3種完整解決方案
- **閱讀時間**：5 分鐘

### 3. 🌐 [網路配置詳細指南](./NETWORK_SETUP_GUIDE.md)
- **適合**：想要深入了解配置
- **內容**：所有配置方式的詳細說明
- **閱讀時間**：10 分鐘

### 4. 🚀 [後端部署指南](./DEPLOY_GUIDE.md)
- **適合**：準備部署到生產環境
- **內容**：各種雲端平台的詳細部署步驟
- **閱讀時間**：15 分鐘

---

## 🛠️ 可用工具

### 自動 IP 更新

```bash
pnpm update-ip
```

**功能**：自動檢測並更新所有配置文件中的 API 地址

**更新的文件**：
- `apps/admin/.env` - Admin 前端配置
- `apps/mobile/src/config.local.ts` - Mobile App 配置

---

### 網路資訊查看

```bash
pnpm show-ip
```

**功能**：顯示當前網路資訊和配置狀態

**顯示內容**：
- 當前局域網 IP
- 電腦名稱和 mDNS 地址
- 當前的 Admin 和 Mobile 配置
- 可用的 API 地址選項

---

### 後端連接檢測

```bash
pnpm check-backend
```

**功能**：測試後端 API 是否正常運行

**檢測項目**：
- localhost 連接測試
- Admin 配置的 API 測試
- Mobile 配置的 API 測試
- 提供修復建議

---

## 🎓 使用場景

### 場景 1：每天開始工作

```bash
# 確保配置是最新的
pnpm show-ip

# 如果 IP 改變了
pnpm update-ip

# 啟動服務
cd apps/backend && pnpm dev
```

---

### 場景 2：切換 WiFi 後

```bash
# 1. 更新配置
pnpm update-ip

# 2. 檢查後端
pnpm check-backend

# 3. 重啟前端（如果在運行）
# 按 Ctrl+C 停止，然後重新啟動
```

---

### 場景 3：前端突然連不上

```bash
# 1. 診斷問題
pnpm check-backend

# 2. 查看配置
pnpm show-ip

# 3. 根據提示修復
pnpm update-ip
```

---

### 場景 4：準備給別人展示

```bash
# 方案 A：使用臨時公開 URL
npm install -g ngrok
ngrok http 3001
# 把 ngrok 提供的 URL 更新到前端配置

# 方案 B：部署到雲端（推薦）
npm install -g @railway/cli
cd apps/backend
railway login
railway up
# 使用 Railway 提供的永久 URL
```

---

## 🎯 解決方案選擇

| 您的情況 | 推薦方案 | 命令 |
|---------|---------|------|
| 本地開發，偶爾換網路 | 自動 IP 腳本 | `pnpm update-ip` |
| 本地開發，固定網路 | mDNS 配置 | 參考 NETWORK_SETUP_GUIDE.md |
| 需要團隊協作 | 部署到雲端 | 參考 DEPLOY_GUIDE.md |
| 臨時展示/測試 | Ngrok | `ngrok http 3001` |

---

## 📊 問題嚴重程度評估

### 🟢 輕微（偶爾切換網路）
**解決方案**：使用 `pnpm update-ip`
**耗時**：每次 30 秒

### 🟡 中等（頻繁切換網路）
**解決方案**：配置 mDNS 或使用 Ngrok
**耗時**：一次設定 5 分鐘

### 🔴 嚴重（每天遇到多次）
**解決方案**：部署到雲端（Railway）
**耗時**：一次設定 10 分鐘，永久解決

---

## 🚀 推薦工作流程

### 階段 1：立即修復（現在）

```bash
pnpm update-ip
```

### 階段 2：改善體驗（今天內）

閱讀 `網路問題終極解決方案.md`，選擇適合的長期方案。

### 階段 3：徹底解決（本週）

如果這個問題真的困擾您：
1. 週末花 15 分鐘
2. 部署後端到 Railway
3. 從此不再煩惱

---

## 💡 額外提示

### 讓工作更順暢

在 `~/.zshrc` 或 `~/.bashrc` 添加別名：

```bash
# Safe-Net 快捷指令
alias sn-ip='cd ~/Desktop/safe-net && pnpm update-ip'
alias sn-check='cd ~/Desktop/safe-net && pnpm check-backend'
alias sn-info='cd ~/Desktop/safe-net && pnpm show-ip'
```

重新載入配置：
```bash
source ~/.zshrc  # 或 source ~/.bashrc
```

現在您可以在任何地方執行：
```bash
sn-ip      # 更新 IP
sn-check   # 檢查後端
sn-info    # 查看資訊
```

---

## 🆘 仍然有問題？

### 步驟 1：運行診斷

```bash
# 完整診斷
pnpm show-ip
pnpm check-backend
curl http://localhost:3001/api/health
```

### 步驟 2：查看日誌

```bash
# 後端日誌
cd apps/backend
pnpm dev
# 觀察輸出

# 前端錯誤（瀏覽器）
# 按 F12 → Console 標籤
```

### 步驟 3：提供資訊

如果需要幫助，請提供：
1. `pnpm show-ip` 的輸出
2. `pnpm check-backend` 的輸出
3. 後端啟動日誌
4. 前端錯誤訊息（F12 Console）

---

## 📈 成功案例

### 案例 1：頻繁出差的開發者

**問題**：每天在不同咖啡廳工作，每次都要手動改配置

**解決方案**：部署到 Railway

**結果**：
- ✅ 任何地方都能直接工作
- ✅ 不用再擔心網路問題
- ✅ 團隊成員也能訪問測試

---

### 案例 2：在家工作的開發者

**問題**：家裡 WiFi 偶爾斷線重連，IP 會變

**解決方案**：使用 mDNS 配置

**結果**：
- ✅ 設定一次，永久有效
- ✅ 不需要執行任何命令
- ✅ 完全無感

---

### 案例 3：公司內部開發

**問題**：辦公室 WiFi 不穩定，經常需要重新連接

**解決方案**：使用 `pnpm update-ip` + 別名

**結果**：
- ✅ 一個命令解決
- ✅ 設定別名後更快速
- ✅ 可以接受的開銷

---

## 🎉 總結

您現在有：
- ✅ 3 個自動化工具
- ✅ 3 種完整解決方案
- ✅ 4 份詳細文件
- ✅ 多個實際案例

**不要再為網路問題煩惱了！**

根據您的情況，選擇最適合的方案，讓開發更順暢！

---

**快速連結**：
- [立即修復](./QUICK_FIX_NETWORK.md) ⚡
- [完整方案](./網路問題終極解決方案.md) 🎯
- [詳細配置](./NETWORK_SETUP_GUIDE.md) 📚
- [雲端部署](./DEPLOY_GUIDE.md) 🚀
