#!/usr/bin/env node

/**
 * 部署前檢查腳本
 * 
 * 用法：node scripts/deploy-check.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(60));
console.log('🔍 Safe-Net 部署前檢查');
console.log('='.repeat(60) + '\n');

let hasErrors = false;
let warnings = 0;

// 檢查項目
const checks = [
  {
    name: '後端 package.json',
    path: 'apps/backend/package.json',
    required: true,
    validate: (content) => {
      const pkg = JSON.parse(content);
      if (!pkg.scripts['start:prod']) {
        return '缺少 start:prod 腳本';
      }
      if (!pkg.scripts['build']) {
        return '缺少 build 腳本';
      }
      return null;
    }
  },
  {
    name: 'Prisma Schema',
    path: 'packages/database/prisma/schema.prisma',
    required: true,
    validate: () => null
  },
  {
    name: '後端 Zeabur 配置',
    path: 'apps/backend/zbpack.json',
    required: false,
    validate: (content) => {
      const config = JSON.parse(content);
      if (!config.build_command) {
        return '缺少 build_command';
      }
      if (!config.start_command) {
        return '缺少 start_command';
      }
      return null;
    }
  },
  {
    name: '前端 Zeabur 配置',
    path: 'apps/admin/zbpack.json',
    required: false,
    validate: (content) => {
      const config = JSON.parse(content);
      if (!config.build_command) {
        return '缺少 build_command';
      }
      if (!config.static) {
        return '缺少 static 配置';
      }
      return null;
    }
  },
  {
    name: '後端環境變數範例',
    path: 'apps/backend/env.example.txt',
    required: false,
    validate: (content) => {
      const requiredVars = ['JWT_SECRET', 'JWT_APP_SECRET', 'DATABASE_URL'];
      const missing = requiredVars.filter(v => !content.includes(v));
      if (missing.length > 0) {
        return `缺少環境變數: ${missing.join(', ')}`;
      }
      return null;
    }
  },
  {
    name: '前端環境變數範例',
    path: 'apps/admin/env.example.txt',
    required: false,
    validate: (content) => {
      if (!content.includes('VITE_API_URL')) {
        return '缺少 VITE_API_URL';
      }
      return null;
    }
  }
];

// 執行檢查
checks.forEach(check => {
  const filePath = path.join(process.cwd(), check.path);
  const exists = fs.existsSync(filePath);
  
  if (!exists) {
    if (check.required) {
      console.log(`❌ ${check.name}: 文件不存在`);
      console.log(`   路徑: ${check.path}`);
      hasErrors = true;
    } else {
      console.log(`⚠️  ${check.name}: 文件不存在（建議創建）`);
      console.log(`   路徑: ${check.path}`);
      warnings++;
    }
    return;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const error = check.validate ? check.validate(content) : null;
    
    if (error) {
      console.log(`❌ ${check.name}: ${error}`);
      console.log(`   路徑: ${check.path}`);
      hasErrors = true;
    } else {
      console.log(`✅ ${check.name}`);
    }
  } catch (err) {
    console.log(`❌ ${check.name}: 無法讀取或解析`);
    console.log(`   錯誤: ${err.message}`);
    hasErrors = true;
  }
});

console.log('\n' + '='.repeat(60));

if (hasErrors) {
  console.log('❌ 檢查失敗！請修復上述錯誤後再部署。');
  process.exit(1);
} else if (warnings > 0) {
  console.log(`⚠️  檢查通過，但有 ${warnings} 個警告。`);
  console.log('建議創建缺少的配置文件以獲得最佳體驗。');
} else {
  console.log('✅ 所有檢查通過！可以開始部署。');
}

console.log('\n📚 接下來的步驟：');
console.log('  1. 查看 ZEABUR_DEPLOY_GUIDE.md');
console.log('  2. 推送代碼到 GitHub');
console.log('  3. 在 Zeabur 創建專案並部署');
console.log('  4. 設定環境變數');
console.log('  5. 執行資料庫遷移');
console.log('='.repeat(60) + '\n');
