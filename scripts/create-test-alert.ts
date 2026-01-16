/**
 * 創建測試警報腳本
 * 用於測試警報分配和通知功能
 * 
 * 使用方式：
 * pnpm test:alert [type]
 * 
 * type: 1=邊界警報, 2=不活躍, 3=低電量, 4=緊急（預設=1）
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestAlert() {
  try {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║         🧪 創建測試警報                             ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');
    
    console.log('🔍 正在查找測試數據...\n');

    // 1. 查找第一個社區
    const tenant = await prisma.tenant.findFirst({
      where: { isActive: true },
    });

    if (!tenant) {
      console.error('❌ 找不到社區，請先運行 db:seed');
      return;
    }

    console.log(`✅ 找到社區: ${tenant.name} (${tenant.code})`);

    // 2. 查找該社區的長輩
    const elder = await prisma.elder.findFirst({
      where: {
        tenantId: tenant.id,
        isActive: true,
      },
    });

    if (!elder) {
      console.error('❌ 找不到長輩');
      return;
    }

    console.log(`✅ 找到長輩: ${elder.name}`);

    // 3. 查找該社區的 Gateway
    const gateway = await prisma.gateway.findFirst({
      where: {
        tenantId: tenant.id,
        isActive: true,
      },
    });

    if (!gateway) {
      console.error('❌ 找不到 Gateway');
      return;
    }

    console.log(`✅ 找到 Gateway: ${gateway.name || gateway.serialNumber}`);

    // 4. 查找該社區的所有已批准成員
    const members = await prisma.tenantMember.findMany({
      where: {
        tenantId: tenant.id,
        status: 'APPROVED',
      },
      include: {
        appUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      take: 3, // 最多選 3 個成員
    });

    if (members.length === 0) {
      console.error('❌ 找不到社區成員');
      return;
    }

    console.log(`✅ 找到 ${members.length} 位成員`);
    members.forEach((m, index) => {
      console.log(`   ${index + 1}. ${m.appUser.name} (${m.appUser.email}) ${m.role === 'ADMIN' ? '[管理員]' : ''}`);
    });

    // 從命令行參數獲取警報類型
    const choice = process.argv[2] || '1';
    
    let alertType = 'BOUNDARY';
    let severity = 'HIGH';
    let title = '邊界點警報';
    let message = `${elder.name} 在 ${gateway.name || '邊界點'} 被偵測到`;
    
    console.log('\n📝 警報類型選項：');
    console.log('1. 邊界警報 (BOUNDARY - HIGH) ⭐');
    console.log('2. 不活躍警報 (INACTIVE - CRITICAL)');
    console.log('3. 低電量警報 (LOW_BATTERY - MEDIUM)');
    console.log('4. 緊急警報 (EMERGENCY - CRITICAL)');
    
    switch (choice.trim()) {
      case '2':
        alertType = 'INACTIVE';
        severity = 'CRITICAL';
        title = '長時間不活躍警報';
        message = `${elder.name} 已超過 24 小時未偵測到活動`;
        break;
      case '3':
        alertType = 'LOW_BATTERY';
        severity = 'MEDIUM';
        title = '設備電量不足';
        message = `${elder.name} 的設備電量剩餘 15%`;
        break;
      case '4':
        alertType = 'EMERGENCY';
        severity = 'CRITICAL';
        title = '緊急求助';
        message = `${elder.name} 觸發緊急求助按鈕`;
        break;
    }

    console.log(`\n✅ 將創建：${title} (${alertType})\n`);

    // 5. 創建測試警報
    const alert = await prisma.alert.create({
      data: {
        tenantId: tenant.id,
        elderId: elder.id,
        gatewayId: gateway.id,
        type: alertType as any,
        severity: severity as any,
        title: `🧪 ${title}`,
        message: `${message}（測試警報）`,
        status: 'PENDING',
        triggeredAt: new Date(),
        location: gateway.location || '測試位置',
        latitude: gateway.latitude,
        longitude: gateway.longitude,
      },
    });

    console.log(`✅ 警報已創建: ${alert.id}`);
    console.log(`   類型: ${alert.type}`);
    console.log(`   嚴重性: ${alert.severity}`);
    console.log(`   訊息: ${alert.message}`);

    console.log('\n✅ 測試警報創建完成！\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 警報資訊：');
    console.log(`   ID: ${alert.id}`);
    console.log(`   類型: ${alert.type}`);
    console.log(`   嚴重性: ${alert.severity}`);
    console.log(`   標題: ${alert.title}`);
    console.log(`   訊息: ${alert.message}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('⚠️  注意：此警報尚未分配給任何成員');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('📱 測試步驟：');
    console.log('   管理員測試分配功能：');
    console.log('   1. 以管理員身份登入 App');
    console.log('   2. 進入「緊急通知」→「所有警報」');
    console.log('   3. 找到新創建的測試警報');
    console.log('   4. 點擊進入詳情');
    console.log('   5. 點擊「分配警報」按鈕');
    console.log('   6. 選擇要分配的成員（可多選）');
    console.log('   7. 確認分配');
    console.log('');
    console.log('   成員測試接受/婉拒：');
    console.log('   1. 以被分配的成員登入');
    console.log('   2. 進入「緊急通知」→「我的警報」');
    console.log('   3. 應該看到被分配的警報');
    console.log('   4. 點擊進入詳情');
    console.log('   5. 測試「接受」或「婉拒」功能\n');

    console.log('💡 提示：');
    console.log('   - 如果 App 已開啟，下拉刷新警報列表');
    console.log('   - 推送通知需要先註冊 Push Token');
    console.log('   - 目前推送通知為模擬模式（僅記錄）\n');

    return alert;
  } catch (error) {
    console.error('❌ 創建測試警報失敗:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 執行腳本
createTestAlert()
  .then(() => {
    console.log('🎉 完成！\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 錯誤:', error.message);
    process.exit(1);
  });
