#!/usr/bin/env node

/**
 * 檢查後端 API 是否正常運行
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

function checkAPI(url) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: parsedUrl.pathname,
      method: 'GET',
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          success: true,
          status: res.statusCode,
          data: data,
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout',
      });
    });

    req.end();
  });
}

function readConfig(filePath, key) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(new RegExp(`${key}\\s*[=:]\\s*['"]?([^'"\\s;]+)`));
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║         🔍 Safe-Net 後端連接檢測                   ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // 讀取配置
  const adminConfig = readConfig(
    path.join(__dirname, '../apps/admin/.env'),
    'VITE_API_URL'
  );
  const mobileConfig = readConfig(
    path.join(__dirname, '../apps/mobile/src/config.local.ts'),
    'API_BASE_URL'
  );

  console.log('📋 當前配置:\n');
  console.log(`   Admin API:  ${adminConfig || '未設定'}`);
  console.log(`   Mobile API: ${mobileConfig || '未設定'}`);
  console.log('');

  // 測試不同的 URL
  const urlsToTest = [
    'http://localhost:3001/api',
    adminConfig,
    mobileConfig,
  ].filter((url, index, self) => url && self.indexOf(url) === index);

  console.log('🧪 測試連接...\n');

  for (const url of urlsToTest) {
    process.stdout.write(`   測試 ${url} ... `);
    
    const result = await checkAPI(`${url.replace(/\/api$/, '')}`);
    
    if (result.success) {
      console.log(`✅ 連接成功 (${result.status})`);
    } else {
      console.log(`❌ 連接失敗: ${result.error}`);
    }
  }

  console.log('\n💡 建議:\n');
  
  const localhostResult = await checkAPI('http://localhost:3001');
  
  if (localhostResult.success) {
    console.log('   ✅ 後端正在運行');
    console.log('   ✅ 如果前端連不上，請執行: pnpm update-ip');
  } else {
    console.log('   ❌ 後端未運行');
    console.log('   💡 請先啟動後端: cd apps/backend && pnpm dev');
  }

  console.log('');
}

main();
