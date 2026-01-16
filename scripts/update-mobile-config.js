#!/usr/bin/env node

/**
 * 更新移動 App API 配置
 * 
 * 用法：node scripts/update-mobile-config.js <backend-url>
 * 範例：node scripts/update-mobile-config.js https://safe-net-backend.zeabur.app
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('\n❌ 錯誤：請提供後端 URL\n');
  console.log('用法：node scripts/update-mobile-config.js <backend-url>');
  console.log('範例：node scripts/update-mobile-config.js https://safe-net-backend.zeabur.app\n');
  process.exit(1);
}

let backendUrl = args[0];

// 移除結尾的斜線
if (backendUrl.endsWith('/')) {
  backendUrl = backendUrl.slice(0, -1);
}

// 確保包含 /api
const apiUrl = backendUrl.endsWith('/api') ? backendUrl : `${backendUrl}/api`;

console.log('\n' + '='.repeat(60));
console.log('📱 更新移動 App API 配置');
console.log('='.repeat(60) + '\n');

console.log(`後端 URL: ${backendUrl}`);
console.log(`API URL:  ${apiUrl}\n`);

// 更新 config.production.ts
const productionConfigPath = path.join(
  process.cwd(),
  'apps/mobile/src/config.production.ts'
);

try {
  let content = fs.readFileSync(productionConfigPath, 'utf-8');
  
  // 替換 API_BASE_URL
  content = content.replace(
    /export const API_BASE_URL = ['"].*?['"];/,
    `export const API_BASE_URL = '${apiUrl}';`
  );
  
  fs.writeFileSync(productionConfigPath, content, 'utf-8');
  console.log('✅ 已更新 config.production.ts');
} catch (err) {
  console.error(`❌ 更新 config.production.ts 失敗: ${err.message}`);
  process.exit(1);
}

// 也更新 config.local.ts（可選）
const localConfigPath = path.join(
  process.cwd(),
  'apps/mobile/src/config.local.ts'
);

if (fs.existsSync(localConfigPath)) {
  try {
    let content = fs.readFileSync(localConfigPath, 'utf-8');
    
    // 替換 API_BASE_URL
    content = content.replace(
      /export const API_BASE_URL = ['"].*?['"];/,
      `export const API_BASE_URL = '${apiUrl}';`
    );
    
    fs.writeFileSync(localConfigPath, content, 'utf-8');
    console.log('✅ 已更新 config.local.ts');
  } catch (err) {
    console.warn(`⚠️  更新 config.local.ts 失敗: ${err.message}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('🎉 配置更新完成！');
console.log('\n📝 接下來的步驟：');
console.log('  1. 測試 API 連接：');
console.log(`     curl ${apiUrl}/health`);
console.log('  2. 重新建置 App：');
console.log('     cd apps/mobile');
console.log('     npx expo start');
console.log('  3. 或使用 EAS Build 發布：');
console.log('     npx eas build --platform all');
console.log('='.repeat(60) + '\n');
