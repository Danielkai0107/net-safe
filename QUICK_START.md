# Safe-Net 快速開始指南

**5 分鐘快速啟動 Safe-Net 系統**

---

## 🚀 快速啟動

### 步驟 1: 啟動資料庫
\`\`\`bash
docker compose up -d
\`\`\`

等待 PostgreSQL 啟動完成（約 10 秒）

### 步驟 2: 初始化資料庫
\`\`\`bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
\`\`\`

### 步驟 3: 啟動 API Server
\`\`\`bash
cd apps/backend
pnpm dev
\`\`\`

等待看到：
\`\`\`
🚀 Server: http://localhost:3001/api
Database: Connected ✅
\`\`\`

### 步驟 4: 測試 API

#### 登入
\`\`\`bash
curl -X POST http://localhost:3001/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@safenet.com","password":"admin123456"}'
\`\`\`

#### Gateway 上傳測試
\`\`\`bash
curl -X POST http://localhost:3001/api/logs/upload \\
  -H "Content-Type: application/json" \\
  -d '{
    "gatewaySerialNumber": "GW-DALOVE-001",
    "macAddress": "AA:BB:CC:DD:EE:01",
    "rssi": -65,
    "distance": 2.5,
    "proximity": "NEAR"
  }'
\`\`\`

✅ **完成！系統已運行！**

---

## 📚 下一步

### 查看資料
\`\`\`bash
pnpm db:studio
# 訪問 http://localhost:5555
\`\`\`

### 查看完整 API 文檔
查看 [COMPLETE_API_REFERENCE.md](COMPLETE_API_REFERENCE.md)

### 測試帳號
- Super Admin: \`admin@safenet.com\` / \`admin123456\`
- 社區管理員: \`admin@dalove.com\` / \`admin123\`
- 一般人員: \`staff@dalove.com\` / \`staff123\`

---

**就是這麼簡單！** 🎉
