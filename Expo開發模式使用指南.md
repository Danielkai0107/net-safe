# 📱 Expo 開發模式使用指南

## 🎯 當前狀況

Expo 開發伺服器正在啟動，請稍候片刻...

---

## ✅ 正確的使用方式

### ❌ 不要執行

```bash
npx expo run:android --device  # ← 不要用這個！
```

這會編譯原生 App，需要 Firebase 配置。

### ✅ 應該使用

```bash
npx expo start  # ← 已經在運行了！
```

然後用 **Expo Go** 連接。

---

## 📱 如何連接到開發伺服器

### 方法 1：Expo Go App（最簡單）⭐

#### 步驟：

1. **下載 Expo Go**

   - 打開 Google Play Store
   - 搜尋 "Expo Go"
   - 下載並安裝（免費）

2. **打開 Expo Go**

3. **連接方式 A - 掃描 QR Code**

   - 查看您的電腦 Expo 終端
   - 應該有一個 QR Code
   - 用 Expo Go 掃描

4. **連接方式 B - 手動輸入**

   - 在 Expo Go 中點擊「Enter URL manually」
   - 輸入：`exp://192.168.1.107:8081`
   - 點擊「Connect」

5. **等待載入**

   - 首次載入可能需要 10-30 秒
   - 會下載 JavaScript bundle

6. **開始使用**
   - 看到登入畫面
   - 登入測試
   - ✅ Push Token 會成功註冊

---

### 方法 2：Development Build（如果已編譯）

如果您的手機上已經有編譯好的 App：

1. **打開 Safe-Net App**

2. **搖動手機**（或三指點擊）

   - 打開開發選單

3. **選擇「Settings」**

4. **選擇「Change Bundle Location」**

5. **輸入**：`192.168.1.107:8081`

6. **返回並重新載入**

---

## 🔍 檢查 Expo 狀態

### 查看 Terminal 50

應該看到：

```
Starting project at /Users/danielkai/Desktop/safe-net/apps/mobile
Starting Metro Bundler

› Metro waiting on exp://192.168.1.107:8081
› Scan the QR code above with Expo Go

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web
```

---

## 🐛 "Something went wrong" 錯誤排查

### 可能原因 1：網路連接問題

**檢查**：

- 手機和電腦在同一 WiFi？
- 可以 ping 通電腦 IP？

**解決**：

```bash
# 在手機瀏覽器訪問
http://192.168.1.107:8081

# 應該看到 Metro Bundler 頁面
```

---

### 可能原因 2：Metro Bundler 還在編譯

**檢查**：

- 查看 Terminal 50 是否還在編譯
- 是否顯示 "Bundling..."

**解決**：

- 等待編譯完成（首次可能需要 1-2 分鐘）
- 編譯完成後重新連接

---

### 可能原因 3：快取問題

**解決**：

```bash
cd apps/mobile

# 清理快取
rm -rf .expo
rm -rf node_modules/.cache

# 重啟 Expo
npx expo start --clear
```

---

### 可能原因 4：代碼錯誤

**檢查**：

- 查看 Expo 終端是否有紅色錯誤訊息
- 查看是否有 TypeScript 錯誤

**解決**：

```bash
# 檢查 TypeScript 錯誤
cd apps/mobile
npx tsc --noEmit
```

---

## 💡 快速修復步驟

### 1. 確認 Expo 正在運行

```bash
curl http://localhost:8081/status
# 應該返回：packager-status:running
```

### 2. 在 Expo Go 中重試

- 下拉刷新
- 或重新掃描 QR Code

### 3. 查看詳細錯誤

- 在 Expo Go 中點擊錯誤訊息
- 查看完整的錯誤堆疊
- 截圖或記下錯誤訊息

---

## 🔧 替代方案

### 如果 Expo Go 一直有問題

#### 方案 A：使用 Android 模擬器

```bash
# 在 Expo 終端按 'a'
# 會自動在模擬器中打開
```

#### 方案 B：使用 Web 版（臨時測試）

```bash
# 在 Expo 終端按 'w'
# 在瀏覽器中打開
```

#### 方案 C：配置 Firebase（完整方案）

如果您需要使用已編譯的 App，我可以幫您配置 Firebase。

---

## 🆘 需要更多資訊

請告訴我：

1. **Expo Go 顯示的完整錯誤訊息**

   - 截圖或完整文字

2. **Expo 終端（Terminal 50）的輸出**

   - 是否有錯誤訊息？
   - 是否顯示 "Metro waiting on..."？

3. **您的連接方式**
   - 使用 Expo Go？
   - 使用已編譯的 App？
   - 使用模擬器？

---

**請提供錯誤訊息的詳細內容，我可以幫您精確診斷！** 🔍
