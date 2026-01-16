import { PrismaClient, AlertType, AlertSeverity, AlertStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestAlerts() {
  console.log('🚨 建立測試警報...\n');

  try {
    // 1. 獲取第一個社區
    const tenant = await prisma.tenant.findFirst({
      where: { isActive: true },
    });

    if (!tenant) {
      throw new Error('找不到社區');
    }

    console.log(`📍 社區: ${tenant.name}`);

    // 2. 獲取第一個長者
    const elder = await prisma.elder.findFirst({
      where: { 
        tenantId: tenant.id,
        isActive: true,
      },
    });

    if (!elder) {
      throw new Error('找不到長者');
    }

    console.log(`👴 長者: ${elder.name}`);

    // 3. 獲取第一個 Gateway
    const gateway = await prisma.gateway.findFirst({
      where: { isActive: true },
    });

    console.log(`📡 Gateway: ${gateway?.name || '無'}\n`);

    // 4. 獲取第一個 App 用戶（用於分配警報）
    const appUser = await prisma.appUser.findFirst({
      where: { isActive: true },
    });

    console.log(`👤 App 用戶: ${appUser?.name || '無'}\n`);

    // 5. 建立測試警報
    const alerts = [];

    // 警報 1: 邊界警報（待處理）
    const alert1 = await prisma.alert.create({
      data: {
        tenantId: tenant.id,
        elderId: elder.id,
        gatewayId: gateway?.id,
        type: AlertType.BOUNDARY,
        severity: AlertSeverity.HIGH,
        status: AlertStatus.PENDING,
        title: '邊界點警報',
        message: `${elder.name} 在邊界點被偵測到`,
        latitude: 25.033,
        longitude: 121.5654,
        location: '社區大門',
        triggeredAt: new Date(),
      },
    });
    alerts.push(alert1);
    console.log('✅ 建立警報 1: 邊界警報（待處理）');

    // 警報 2: 不活躍警報（待處理）
    const alert2 = await prisma.alert.create({
      data: {
        tenantId: tenant.id,
        elderId: elder.id,
        type: AlertType.INACTIVE,
        severity: AlertSeverity.MEDIUM,
        status: AlertStatus.PENDING,
        title: '不活躍警報',
        message: `${elder.name} 已超過 24 小時未偵測到活動`,
        triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小時前
      },
    });
    alerts.push(alert2);
    console.log('✅ 建立警報 2: 不活躍警報（待處理）');

    // 警報 3: 首次活動（已完成）
    const alert3 = await prisma.alert.create({
      data: {
        tenantId: tenant.id,
        elderId: elder.id,
        gatewayId: gateway?.id,
        type: AlertType.FIRST_ACTIVITY,
        severity: AlertSeverity.LOW,
        status: AlertStatus.RESOLVED,
        title: '當日首次活動',
        message: `${elder.name} 今日首次活動記錄`,
        triggeredAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4小時前
        resolvedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3小時前
      },
    });
    alerts.push(alert3);
    console.log('✅ 建立警報 3: 首次活動（已完成）');

    // 6. 如果有 App 用戶，分配警報給他
    if (appUser) {
      console.log('\n📋 分配警報給 App 用戶...');
      
      for (const alert of [alert1, alert2]) {
        await prisma.alertAssignment.create({
          data: {
            alertId: alert.id,
            appUserId: appUser.id,
            isAccepted: false,
          },
        });
        console.log(`✅ 警報 ${alert.type} 已分配給 ${appUser.name}`);
      }
    }

    console.log('\n🎉 測試警報建立完成！');
    console.log(`   總共建立: ${alerts.length} 個警報`);
    console.log(`   待處理: 2 個`);
    console.log(`   已完成: 1 個`);

    if (appUser) {
      console.log(`\n💡 提示：使用以下帳號登入查看警報`);
      console.log(`   Email: ${appUser.email}`);
      console.log(`   (密碼請參考種子資料)`);
    }

  } catch (error) {
    console.error('❌ 建立失敗:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestAlerts();
