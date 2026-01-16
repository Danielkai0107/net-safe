# 🔧 解決 Firebase 錯誤

## ⚠️ 問題診斷

您還在使用**已編譯的原生 App**（`com.safenet.app`），而不是透過 **Expo 開發模式**連接。

這就是為什麼還會看到 Firebase 錯誤！

---

## 🎯 解決方案

### 選項 A：使用 Expo Go App（最快）⭐

#### 1. 在手機上安裝 Expo Go
- **Android**: Google Play Store 搜尋 "Expo Go"
- **iOS**: App Store 搜尋 "Expo Go"

#### 2. 打開 Expo Go

#### 3. 連接到開發伺服器
- **掃描 QR Code**（在 Expo 終端顯示）
- 或在同一 WiFi 下自動發現

#### 4. 登入測試
- 在 Expo Go 中打開 App
- 登入
- ✅ Push Token 會成功註冊
- ✅ 不會有 Firebase 錯誤

---

### 選項 B：卸載已編譯的 App，用開發模式

#### 1. 卸載已編譯的 App
```bash
# Android
adb uninstall com.safenet.app

# 或在手機上長按 App 圖示選擇卸載
```

#### 2. 使用 Expo 開發客戶端
```bash
cd apps/mobile

# 在 Expo 終端按 'a' 在模擬器運行
# 或使用 Expo Go 連接實體設備
```

---

### 選項 C：配置 Firebase（如果要繼續用已編譯的 App）

如果您想繼續使用 `npx expo run:android` 編譯的 App，則需要配置 Firebase：

#### 1. 創建 Firebase 專案
訪問：https://console.firebase.google.com/

#### 2. 添加 Android App
- 點擊 Android 圖示
- 套件名稱：`com.safenet.app`
- 下載 `google-services.json`

#### 3. 放置配置文件
```bash
# 將 google-services.json 放到：
apps/mobile/android/app/google-services.json
```

#### 4. 重新編譯
```bash
cd apps/mobile
npx expo run:android --device
```

---

## 💡 我的建議

### 現在（推薦）- 使用 Expo Go

**為什麼？**
- ✅ 3 分鐘內解決
- ✅ 推送通知立即可用
- ✅ 無需任何配置
- ✅ 標準開發流程

**步驟**：
1. 在手機上安裝 Expo Go App
2. 打開 Expo Go
3. 掃描 QR Code 或自動連接
4. 登入測試

---

### 週末（如果需要）- 配置 Firebase

**為什麼？**
- 如果您需要測試特定的原生功能
- 或準備發布到商店

**時間**：約 30 分鐘

---

## 🔍 判斷您正在使用哪個 App

### 已編譯的 App（原生）
- 套件名稱：`com.safenet.app`
- 錯誤訊息：Firebase 未初始化
- 圖示：您的 App 圖示

### Expo Go
- 套件名稱：`host.exp.exponent`
- 無 Firebase 錯誤
- 圖示：Expo Go 圖示

---

## 🚀 立即行動

### 方案 1：使用 Expo Go（3 分鐘）

```bash
1. 在手機安裝 Expo Go App
2. 打開 Expo Go
3. 掃描 QR Code（在 Expo 終端）
4. 登入測試
```

### 方案 2：卸載重來（5 分鐘）

```bash
# 1. 卸載已編譯的 App
adb uninstall com.safenet.app

# 2. 使用 Expo Go 或模擬器
cd apps/mobile
# 在 Expo 終端按 'a' 使用模擬器
```

### 方案 3：配置 Firebase（30 分鐘）

如果您真的需要使用已編譯的 App，我可以幫您配置 Firebase。

---

## 🎯 推薦順序

1. **立即**：使用 Expo Go（最快）
2. **今天**：測試所有推送通知功能
3. **週末**：如果需要，配置 Firebase

---

**您想使用哪個方案？**

我強烈推薦**方案 1（Expo Go）**，這是最快且最標準的開發方式！

只需：
1. 下載 Expo Go App
2. 掃描 QR Code
3. 立即測試

要我提供詳細的 Expo Go 使用指南嗎？
