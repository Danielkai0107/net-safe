# 🔥 快速修復網路問題

## 現在就解決！（1 分鐘）

### 步驟 1：更新配置

```bash
pnpm update-ip
```

這會自動檢測您的 IP 並更新所有配置文件。

### 步驟 2：重啟服務

```bash
# 終端 1 - 啟動後端
cd apps/backend
pnpm dev

# 終端 2 - 啟動 Admin（如果需要）
cd apps/admin
pnpm dev

# 終端 3 - 啟動 Mobile App（如果需要）
cd apps/mobile
pnpm android
```

### 完成！✅

您的前端現在應該能正常連接後端了。

---

## 💡 為什麼會發生這個問題？

當您切換 WiFi 網路時：
1. 您的電腦獲得新的 IP 地址
2. 但前端配置還使用舊的 IP
3. 導致無法連接後端

---

## 🎯 長期解決方案

### 選項 1：每次切換網路時執行

```bash
pnpm update-ip
```

### 選項 2：使用 mDNS（不用改配置）

```bash
# 查看您的電腦名稱
hostname

# 然後修改配置使用 .local 域名
# 例如：http://MacBook-Pro.local:3001/api
```

詳細步驟請看：`NETWORK_SETUP_GUIDE.md`

### 選項 3：部署後端到雲端（一勞永逸）

```bash
# 使用 Railway（最簡單）
npm install -g @railway/cli
cd apps/backend
railway login
railway init
railway up
```

完整指南請看：`DEPLOY_GUIDE.md`

---

## 📱 如果還是連不上？

### 檢查 1：後端是否運行？

```bash
curl http://localhost:3001/api/health
```

應該返回：`{"status":"ok"}`

### 檢查 2：查看當前配置

```bash
pnpm show-ip
```

### 檢查 3：防火牆

確保防火牆允許 Node.js 接受傳入連接。

---

## 🆘 需要幫助？

運行診斷：

```bash
# 顯示網路資訊
pnpm show-ip

# 測試 API
curl http://localhost:3001/api/health

# 查看後端日誌
cd apps/backend && pnpm dev
```

把錯誤訊息發給我！
