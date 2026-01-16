#!/usr/bin/env node

/**
 * 生成部署所需的安全密鑰
 * 
 * 用法：node scripts/generate-secrets.js
 */

const crypto = require('crypto');

console.log('\n' + '='.repeat(60));
console.log('🔐 Safe-Net 安全密鑰生成器');
console.log('='.repeat(60) + '\n');

// 生成密鑰
const jwtSecret = crypto.randomBytes(32).toString('hex');
const jwtAppSecret = crypto.randomBytes(32).toString('hex');
const databasePassword = crypto.randomBytes(16).toString('hex');

console.log('📋 複製以下環境變數到您的部署平台：\n');

console.log('# 管理後台 JWT 密鑰');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('');

console.log('# 移動 App JWT 密鑰');
console.log(`JWT_APP_SECRET=${jwtAppSecret}`);
console.log('');

console.log('# 資料庫密碼（如果需要）');
console.log(`POSTGRES_PASSWORD=${databasePassword}`);
console.log('');

console.log('='.repeat(60));
console.log('✅ 密鑰生成完成！');
console.log('');
console.log('📝 注意事項：');
console.log('  1. 請妥善保管這些密鑰');
console.log('  2. 不要提交到 Git');
console.log('  3. 每個環境使用不同的密鑰');
console.log('  4. 定期更換密鑰（建議每季度）');
console.log('='.repeat(60) + '\n');
