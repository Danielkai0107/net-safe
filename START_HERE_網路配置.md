# 👋 從這裡開始 - 網路配置指南

## 🎯 您遇到的問題

> **「為什麼換 WiFi 或網路，前端就抓不到後端資料了？」**

這是因為前端配置使用了**固定的 IP 地址**，當您切換網路時，電腦的 IP 改變了，但配置沒有更新。

---

## ⚡ 立即解決（30 秒）

### 步驟 1：執行自動修復

```bash
pnpm update-ip
```

這會自動：
- ✅ 檢測您當前的 IP 地址
- ✅ 更新 Admin 前端配置
- ✅ 更新 Mobile App 配置

### 步驟 2：重啟前端（如果正在運行）

```bash
# Admin 前端
cd apps/admin && pnpm dev

# Mobile App
cd apps/mobile && pnpm android
```

### ✅ 完成！

---

## 🎓 我為您準備了什麼

### 1. 三個自動化工具

```bash
pnpm update-ip      # 🔄 自動更新 IP 配置
pnpm show-ip        # 📊 查看網路資訊和配置狀態
pnpm check-backend  # 🧪 檢測後端是否正常運行
```

### 2. 三種完整解決方案

| 方案 | 適合 | 特點 | 耗時 |
|------|------|------|------|
| 自動 IP 腳本 | 開發環境 | 一個命令解決 | 30秒 |
| mDNS 配置 | 固定設備 | 一次設定永久有效 | 5分鐘 |
| 雲端部署 | 生產環境 | 一勞永逸 | 15分鐘 |

### 3. 五份詳細文件

| 文件 | 內容 | 閱讀時間 |
|------|------|----------|
| 🔥 [網路問題已解決](./🔥_網路問題已解決.md) | 已完成的工作總結 | 2分鐘 |
| ⚡ [快速修復](./QUICK_FIX_NETWORK.md) | 最快的修復步驟 | 1分鐘 |
| 🎯 [終極解決方案](./網路問題終極解決方案.md) | 三種完整方案詳解 | 5分鐘 |
| 📚 [詳細配置指南](./NETWORK_SETUP_GUIDE.md) | 所有配置方式說明 | 10分鐘 |
| 🚀 [部署指南](./DEPLOY_GUIDE.md) | 雲端部署完整步驟 | 15分鐘 |

### 4. 一張快速參考卡

[快速參考卡](./快速參考卡.md) - 列印貼在螢幕旁！

---

## 📖 建議閱讀順序

### 如果您現在就需要解決問題

1. ⚡ [快速修復](./QUICK_FIX_NETWORK.md) - 1 分鐘
2. 🔥 [網路問題已解決](./🔥_網路問題已解決.md) - 了解已完成的工作

### 如果您想徹底解決這個問題

1. 🎯 [終極解決方案](./網路問題終極解決方案.md) - 了解所有方案
2. 📚 [詳細配置指南](./NETWORK_SETUP_GUIDE.md) - 深入學習
3. 🚀 [部署指南](./DEPLOY_GUIDE.md) - 部署到雲端

---

## 🎯 根據您的情況選擇

### 情況 1：我只是偶爾換網路

**推薦**：使用自動 IP 腳本

```bash
# 每次切換網路後執行
pnpm update-ip
```

**優點**：簡單快速，30 秒解決

---

### 情況 2：我經常在不同地方工作

**推薦**：部署到雲端（Railway）

```bash
npm install -g @railway/cli
cd apps/backend
railway login
railway init
railway up
```

**優點**：一次設定，永久解決，任何網路都能用

詳細步驟：[部署指南](./DEPLOY_GUIDE.md)

---

### 情況 3：我主要在固定地點開發

**推薦**：使用 mDNS 配置

```typescript
// 使用電腦名稱（不會因為換網路而改變）
export const API_BASE_URL = 'http://DanieldeMacBook-Air.local:3001/api';
```

**優點**：設定一次，不用再管

詳細步驟：[詳細配置指南](./NETWORK_SETUP_GUIDE.md) → 方案 2

---

## 🔧 當前狀態

### ✅ 已為您完成

- ✅ 檢測到您的 IP：`192.168.1.107`
- ✅ 已更新 Admin 配置：`http://192.168.1.107:3001/api`
- ✅ 已更新 Mobile 配置：`http://192.168.1.107:3001/api`
- ✅ 後端連接測試：通過

### 🚀 現在可以

直接啟動服務開始開發：

```bash
# 後端（如果還沒啟動）
cd apps/backend && pnpm dev

# Admin 前端
cd apps/admin && pnpm dev

# Mobile App
cd apps/mobile && pnpm android
```

---

## 💡 實用技巧

### 設定命令別名（可選）

在 `~/.zshrc` 或 `~/.bashrc` 添加：

```bash
# Safe-Net 快捷指令
alias sn-ip='cd ~/Desktop/safe-net && pnpm update-ip'
alias sn-check='cd ~/Desktop/safe-net && pnpm check-backend'
alias sn-info='cd ~/Desktop/safe-net && pnpm show-ip'
```

重新載入：
```bash
source ~/.zshrc
```

現在可以在任何地方執行：
```bash
sn-ip      # 更新 IP
sn-check   # 檢查後端
sn-info    # 查看資訊
```

---

## 🆘 遇到問題？

### 快速診斷

```bash
# 1. 查看網路資訊
pnpm show-ip

# 2. 檢查後端連接
pnpm check-backend

# 3. 測試 API
curl http://localhost:3001/api/health
```

### 常見問題

**Q: 執行 `pnpm update-ip` 後還是連不上？**

A: 確認：
1. 後端是否在運行？
2. 是否重啟了前端？
3. 防火牆是否允許連接？

詳細排查：[終極解決方案](./網路問題終極解決方案.md) → 常見問題

---

## 📊 效果對比

### 之前（每次 10-30 分鐘）

```
切換 WiFi 
→ 前端連不上 😫
→ Google 搜尋 🔍
→ 手動查 IP 
→ 手動改配置 ✏️
→ 重啟前端 
→ 還是不行 😭
→ 繼續排查...
```

### 現在（30 秒）

```
切換 WiFi 
→ pnpm update-ip ⚡
→ 重啟前端 
→ 完成！✅
```

### 部署後（0 秒）

```
切換 WiFi 
→ 繼續工作 🎉
```

---

## 🎉 總結

您現在有：

✅ **完整的自動化工具** - 一鍵解決問題  
✅ **三種解決方案** - 適應不同需求  
✅ **詳細的文件** - 涵蓋所有細節  
✅ **當前已配置** - 立即可用  

**不要再為網路問題煩惱了！**

---

## 🚀 下一步

### 現在（推薦）

繼續開發，切換網路時執行 `pnpm update-ip`

### 今天（如果有時間）

閱讀 [終極解決方案](./網路問題終極解決方案.md)，了解其他方案

### 週末（如果真的煩）

部署到 Railway，徹底解決問題（15 分鐘）

---

## 📞 需要幫助？

查看詳細文件或隨時問我！

---

**祝您開發順利！** 🎊

---

**創建時間**：2026-01-16  
**當前 IP**：192.168.1.107  
**狀態**：✅ 已配置完成
