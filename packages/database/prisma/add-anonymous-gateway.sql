-- 建立匿名守護者預設接收點
-- 此接收點供所有匿名掃描使用

INSERT INTO "gateways" (
  id,
  "serialNumber",
  name,
  location,
  type,
  "isActive",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'ANONYMOUS-GUARDIAN-DEFAULT',
  '匿名守護者預設接收點',
  '移動式接收點（匿名用戶）',
  'GENERAL',
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("serialNumber") DO NOTHING;

-- 查詢結果
SELECT id, "serialNumber", name, type, "isActive" 
FROM "gateways" 
WHERE "serialNumber" = 'ANONYMOUS-GUARDIAN-DEFAULT';
