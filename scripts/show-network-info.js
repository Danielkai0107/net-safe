#!/usr/bin/env node

/**
 * 顯示網路資訊和配置狀態
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const priority = ['Wi-Fi', 'en0', 'en1', 'eth0'];
  
  for (const name of priority) {
    const iface = interfaces[name];
    if (iface) {
      for (const alias of iface) {
        if (alias.family === 'IPv4' && !alias.internal) {
          return alias.address;
        }
      }
    }
  }
  
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  
  return 'localhost';
}

function readConfig(filePath, key) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(new RegExp(`${key}\\s*[=:]\\s*['"]?([^'"\\s;]+)`));
    return match ? match[1] : '未設定';
  } catch (error) {
    return '文件不存在';
  }
}

function main() {
  const localIP = getLocalIP();
  const hostname = os.hostname();
  
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║         🌐 Safe-Net 網路配置資訊                   ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');
  
  console.log('📍 網路資訊:');
  console.log(`   本機 IP: ${localIP}`);
  console.log(`   電腦名稱: ${hostname}`);
  console.log(`   可用地址: ${hostname}.local (mDNS)`);
  console.log('');
  
  console.log('⚙️  當前配置:');
  console.log(`   Admin (.env): ${readConfig(path.join(__dirname, '../apps/admin/.env'), 'VITE_API_URL')}`);
  console.log(`   Mobile (config.local.ts): ${readConfig(path.join(__dirname, '../apps/mobile/src/config.local.ts'), 'API_BASE_URL')}`);
  console.log('');
  
  console.log('🔗 可用的 API 地址:');
  console.log(`   ✅ http://${localIP}:3001/api (推薦)`);
  console.log(`   ✅ http://${hostname}.local:3001/api (mDNS)`);
  console.log(`   ⚠️  http://localhost:3001/api (僅本機/模擬器)`);
  console.log(`   ⚠️  http://10.0.2.2:3001/api (僅 Android 模擬器)`);
  console.log('');
  
  console.log('💡 常用命令:');
  console.log('   pnpm update-ip    # 更新所有配置為當前 IP');
  console.log('   pnpm show-ip      # 顯示此資訊');
  console.log('');
  
  console.log('🚀 啟動服務:');
  console.log('   cd apps/backend && pnpm dev    # 啟動後端');
  console.log('   cd apps/admin && pnpm dev      # 啟動管理後台');
  console.log('   cd apps/mobile && pnpm android # 啟動 App');
  console.log('');
}

main();
