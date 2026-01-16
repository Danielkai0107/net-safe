#!/usr/bin/env node

/**
 * 自動獲取本機局域網 IP 地址
 * 用於動態配置 API URL，解決換網路後無法連接的問題
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  // 優先順序：Wi-Fi > en0 > 其他
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
  
  // 如果沒找到，搜索所有接口
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

function updateMobileConfig(ip) {
  const configPath = path.join(__dirname, '../apps/mobile/src/config.local.ts');
  const port = process.env.PORT || '3001';
  
  const content = `/**
 * API 配置 - 自動生成
 * 
 * 本機 IP: ${ip}
 * 生成時間: ${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}
 * 
 * 💡 切換網路後，請執行: pnpm update-ip
 */

export const API_BASE_URL = 'http://${ip}:${port}/api';

// 其他可用選項：
// export const API_BASE_URL = 'http://localhost:${port}/api'; // 模擬器使用
// export const API_BASE_URL = 'http://10.0.2.2:${port}/api';  // Android 模擬器
`;
  
  fs.writeFileSync(configPath, content, 'utf8');
  console.log(`✅ Mobile config updated: ${configPath}`);
}

function updateAdminEnv(ip) {
  const envPath = path.join(__dirname, '../apps/admin/.env');
  const port = process.env.PORT || '3001';
  
  const content = `# API 配置 - 自動生成
# 本機 IP: ${ip}
# 生成時間: ${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}
# 
# 💡 切換網路後，請執行: pnpm update-ip

VITE_API_URL=http://${ip}:${port}/api
`;
  
  fs.writeFileSync(envPath, content, 'utf8');
  console.log(`✅ Admin .env updated: ${envPath}`);
}

function main() {
  const localIP = getLocalIP();
  
  console.log('\n🔍 網路資訊檢測\n');
  console.log(`📍 本機局域網 IP: ${localIP}`);
  console.log(`🌐 電腦名稱: ${os.hostname()}`);
  console.log(`💻 系統: ${os.platform()} ${os.release()}`);
  
  console.log('\n📝 更新配置文件...\n');
  
  updateMobileConfig(localIP);
  updateAdminEnv(localIP);
  
  console.log('\n✨ 完成！現在您可以：\n');
  console.log(`1️⃣  啟動後端: cd apps/backend && pnpm dev`);
  console.log(`2️⃣  啟動 Admin: cd apps/admin && pnpm dev`);
  console.log(`3️⃣  啟動 Mobile: cd apps/mobile && pnpm android`);
  console.log('\n');
  console.log(`🔗 API 地址: http://${localIP}:3001/api`);
  console.log(`🔗 Admin 地址: http://${localIP}:5173`);
  console.log('\n💡 切換網路後，重新執行: pnpm update-ip\n');
}

main();
