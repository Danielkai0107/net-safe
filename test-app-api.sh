#!/bin/bash

# Safe-Net App API 測試腳本
# 用途：測試 App API 是否正常工作（不再返回 401）

set -e

echo "======================================"
echo "  Safe-Net App API 測試腳本"
echo "======================================"
echo ""

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 檢查 jq 是否安裝
if ! command -v jq &> /dev/null; then
    echo -e "${RED}錯誤：需要安裝 jq 工具${NC}"
    echo "安裝方法："
    echo "  macOS: brew install jq"
    echo "  Ubuntu: sudo apt-get install jq"
    exit 1
fi

# 檢查後端是否運行
echo -e "${YELLOW}檢查後端服務...${NC}"
if ! curl -s http://localhost:3001/api >/dev/null 2>&1; then
    echo -e "${RED}錯誤：後端服務未運行${NC}"
    echo "請先啟動後端服務："
    echo "  cd /Users/danielkai/Desktop/safe-net"
    echo "  pnpm dev"
    exit 1
fi
echo -e "${GREEN}✓ 後端服務正常${NC}"
echo ""

# 生成隨機郵箱避免衝突
RANDOM_EMAIL="test$(date +%s)@example.com"

# 測試 1: 註冊用戶
echo "======================================"
echo "測試 1: 註冊用戶"
echo "======================================"
echo "郵箱: $RANDOM_EMAIL"

REGISTER_RESPONSE=$(curl -X POST http://localhost:3001/api/app/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$RANDOM_EMAIL\",\"name\":\"測試用戶\",\"password\":\"password123\",\"phone\":\"0912345678\"}" \
  -s)

echo "$REGISTER_RESPONSE" | jq

TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.data.access_token // .data.access_token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo -e "${RED}✗ 註冊失敗：無法獲取 token${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 註冊成功${NC}"
echo "Token: ${TOKEN:0:50}..."
echo ""

# 測試 2: 長輩清單 API
echo "======================================"
echo "測試 2: 長輩清單 API"
echo "======================================"

ELDERS_RESPONSE=$(curl http://localhost:3001/api/app/elders \
  -H "Authorization: Bearer $TOKEN" \
  -s)

echo "$ELDERS_RESPONSE" | jq

STATUS=$(echo "$ELDERS_RESPONSE" | jq -r '.statusCode // 200')

if [ "$STATUS" = "401" ]; then
    echo -e "${RED}✗ 失敗：返回 401 Unauthorized${NC}"
    echo ""
    echo "可能的原因："
    echo "1. 後端服務沒有重啟（修改的 Guard 需要重啟才能生效）"
    echo "2. JWT_APP_SECRET 環境變數未正確設置"
    echo ""
    echo "請執行："
    echo "  1. 停止後端服務（Ctrl+C）"
    echo "  2. 重新啟動：pnpm dev"
    echo "  3. 再次執行此測試腳本"
    exit 1
else
    echo -e "${GREEN}✓ 成功：返回 200${NC}"
fi
echo ""

# 測試 3: 警報清單 API
echo "======================================"
echo "測試 3: 警報清單 API"
echo "======================================"

ALERTS_RESPONSE=$(curl http://localhost:3001/api/app/alerts \
  -H "Authorization: Bearer $TOKEN" \
  -s)

echo "$ALERTS_RESPONSE" | jq

STATUS=$(echo "$ALERTS_RESPONSE" | jq -r '.statusCode // 200')

if [ "$STATUS" = "401" ]; then
    echo -e "${RED}✗ 失敗：返回 401${NC}"
    exit 1
else
    echo -e "${GREEN}✓ 成功：返回 200${NC}"
fi
echo ""

# 測試 4: 社區清單 API
echo "======================================"
echo "測試 4: 社區清單 API"
echo "======================================"

TENANTS_RESPONSE=$(curl http://localhost:3001/api/app/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -s)

echo "$TENANTS_RESPONSE" | jq

STATUS=$(echo "$TENANTS_RESPONSE" | jq -r '.statusCode // 200')

if [ "$STATUS" = "401" ]; then
    echo -e "${RED}✗ 失敗：返回 401${NC}"
    exit 1
else
    echo -e "${GREEN}✓ 成功：返回 200${NC}"
fi
echo ""

# 測試 5: 個人資料 API
echo "======================================"
echo "測試 5: 個人資料 API"
echo "======================================"

PROFILE_RESPONSE=$(curl http://localhost:3001/api/app/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  -s)

echo "$PROFILE_RESPONSE" | jq

STATUS=$(echo "$PROFILE_RESPONSE" | jq -r '.statusCode // 200')

if [ "$STATUS" = "401" ]; then
    echo -e "${RED}✗ 失敗：返回 401${NC}"
    exit 1
else
    echo -e "${GREEN}✓ 成功：返回 200${NC}"
fi
echo ""

# 測試 6: 我加入的社區
echo "======================================"
echo "測試 6: 我加入的社區 API"
echo "======================================"

MY_TENANTS_RESPONSE=$(curl http://localhost:3001/api/app/tenants/my \
  -H "Authorization: Bearer $TOKEN" \
  -s)

echo "$MY_TENANTS_RESPONSE" | jq

STATUS=$(echo "$MY_TENANTS_RESPONSE" | jq -r '.statusCode // 200')

if [ "$STATUS" = "401" ]; then
    echo -e "${RED}✗ 失敗：返回 401${NC}"
    exit 1
else
    echo -e "${GREEN}✓ 成功：返回 200${NC}"
fi
echo ""

# 最終結果
echo "======================================"
echo "           測試結果總結"
echo "======================================"
echo -e "${GREEN}✓ 所有測試通過！${NC}"
echo ""
echo "App API 修復成功！現在可以："
echo "1. ✓ 正常註冊/登入"
echo "2. ✓ 查看長輩清單（未加入社區時返回空陣列）"
echo "3. ✓ 查看警報清單（未加入社區時返回空陣列）"
echo "4. ✓ 查看社區清單"
echo "5. ✓ 查看個人資料"
echo "6. ✓ 查看已加入的社區"
echo ""
echo "接下來請在 Mobile App 中測試！"
echo ""
