import { PrismaClient, UserRole, ElderStatus, DeviceType, GatewayType, TenantMemberRole, MembershipStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 開始資料庫初始化...\n');

  // 清除現有資料（開發環境使用，生產環境請移除）
  console.log('⚠️  清除現有資料...');
  await prisma.alertAssignment.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.locationLog.deleteMany();
  await prisma.log.deleteMany();
  await prisma.device.deleteMany();
  await prisma.elder.deleteMany();
  await prisma.gateway.deleteMany();
  await prisma.pushToken.deleteMany();
  await prisma.tenantMember.deleteMany();
  await prisma.appUser.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // ==================== 1. 建立 Super Admin ====================
  console.log('\n👤 建立 Super Admin...');
  const hashedPassword = await bcrypt.hash('admin123456', 10);
  
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@safenet.com',
      name: '系統管理員',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      phone: '0912-345-678',
      isActive: true,
    },
  });
  console.log(`✅ Super Admin 建立成功: ${superAdmin.email}`);

  // ==================== 2. 建立測試社區 ====================
  console.log('\n🏘️  建立測試社區...');
  
  const testTenant = await prisma.tenant.create({
    data: {
      code: 'DALOVE001',
      name: '大愛社區',
      address: '台北市信義區信義路五段7號',
      contactPerson: '王志工',
      contactPhone: '02-2345-6789',
      settings: {
        inactiveAlertHours: 24,
        boundaryAlertEnabled: true,
        firstActivityAlertEnabled: true,
      },
      isActive: true,
    },
  });
  console.log(`✅ 社區建立成功: ${testTenant.name} (${testTenant.code})`);

  // 建立社區管理員
  const tenantAdminPassword = await bcrypt.hash('admin123', 10);
  const tenantAdmin = await prisma.user.create({
    data: {
      tenantId: testTenant.id,
      email: 'admin@dalove.com',
      name: '王管理員',
      password: tenantAdminPassword,
      role: UserRole.TENANT_ADMIN,
      phone: '0912-111-222',
      isActive: true,
    },
  });
  console.log(`✅ 社區管理員建立成功: ${tenantAdmin.email}`);

  // 建立一般人員
  const staffPassword = await bcrypt.hash('staff123', 10);
  const staff = await prisma.user.create({
    data: {
      tenantId: testTenant.id,
      email: 'staff@dalove.com',
      name: '李志工',
      password: staffPassword,
      role: UserRole.STAFF,
      phone: '0912-333-444',
      isActive: true,
    },
  });
  console.log(`✅ 一般人員建立成功: ${staff.email}`);

  // ==================== 3. 建立 Gateway ====================
  console.log('\n📡 建立 Gateway 接收點...');
  
  const gateway1 = await prisma.gateway.create({
    data: {
      tenantId: testTenant.id,
      serialNumber: 'GW-DALOVE-001',
      name: '社區大門',
      location: '社區正門入口',
      type: GatewayType.BOUNDARY,
      latitude: 25.033,
      longitude: 121.5654,
      isActive: true,
    },
  });
  console.log(`✅ Gateway 建立成功: ${gateway1.name} (${gateway1.serialNumber})`);

  const gateway2 = await prisma.gateway.create({
    data: {
      tenantId: testTenant.id,
      serialNumber: 'GW-DALOVE-002',
      name: '活動中心',
      location: '社區活動中心',
      type: GatewayType.GENERAL,
      latitude: 25.0335,
      longitude: 121.5658,
      isActive: true,
    },
  });
  console.log(`✅ Gateway 建立成功: ${gateway2.name} (${gateway2.serialNumber})`);

  // 建立移動接收點（志工手機）
  const mobileGateway = await prisma.gateway.create({
    data: {
      tenantId: testTenant.id,
      serialNumber: 'MOBILE-IPHONE-A3K9F2',
      name: '志工巡守 - 李志工',
      location: '移動接收點',
      type: GatewayType.MOBILE,
      deviceInfo: {
        brand: 'Apple',
        model: 'iPhone 15',
        osVersion: 'iOS 17.2',
        appVersion: '1.0.0',
      },
      isActive: true,
    },
  });
  console.log(`✅ 移動接收點建立成功: ${mobileGateway.name} (${mobileGateway.serialNumber})`);

  // ==================== 4. 建立長者資料 ====================
  console.log('\n👴 建立長者資料...');
  
  const elder1 = await prisma.elder.create({
    data: {
      tenantId: testTenant.id,
      name: '陳阿公',
      phone: '0912-555-666',
      address: '大愛社區 A 棟 3 樓',
      emergencyContact: '陳小明（兒子）',
      emergencyPhone: '0912-777-888',
      notes: '患有輕度失智，需要特別關注',
      status: ElderStatus.ACTIVE,
      inactiveThresholdHours: 24,
      lastActivityAt: new Date(),
      isActive: true,
    },
  });
  console.log(`✅ 長者建立成功: ${elder1.name}`);

  const elder2 = await prisma.elder.create({
    data: {
      tenantId: testTenant.id,
      name: '林阿嬤',
      phone: '0912-666-777',
      address: '大愛社區 B 棟 2 樓',
      emergencyContact: '林小華（女兒）',
      emergencyPhone: '0912-888-999',
      notes: '行動不便，使用輪椅',
      status: ElderStatus.ACTIVE,
      inactiveThresholdHours: 12,
      lastActivityAt: new Date(),
      isActive: true,
    },
  });
  console.log(`✅ 長者建立成功: ${elder2.name}`);

  // ==================== 5. 建立 Beacon 設備 ====================
  console.log('\n📱 建立 Beacon 設備...');
  
  const device1 = await prisma.device.create({
    data: {
      tenantId: testTenant.id,  // 設備已分配給社區
      elderId: elder1.id,
      macAddress: 'AA:BB:CC:DD:EE:01',
      uuid: 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825',
      major: 100,
      minor: 1,
      deviceName: '陳阿公的手環',
      type: DeviceType.IBEACON,
      batteryLevel: 85,
      lastSeen: new Date(),
      lastGatewayId: gateway2.id,
      isActive: true,
    },
  });
  console.log(`✅ Beacon 建立成功: ${device1.deviceName} (${device1.macAddress})`);

  const device2 = await prisma.device.create({
    data: {
      tenantId: testTenant.id,  // 設備已分配給社區
      elderId: elder2.id,
      macAddress: 'AA:BB:CC:DD:EE:02',
      uuid: 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825',
      major: 100,
      minor: 2,
      deviceName: '林阿嬤的手環',
      type: DeviceType.IBEACON,
      batteryLevel: 92,
      lastSeen: new Date(),
      lastGatewayId: gateway2.id,
      isActive: true,
    },
  });
  console.log(`✅ Beacon 建立成功: ${device2.deviceName} (${device2.macAddress})`);

  // 建立未分配的設備（供測試設備分配功能）
  const device3 = await prisma.device.create({
    data: {
      tenantId: null,  // 未分配
      elderId: null,
      macAddress: 'AA:BB:CC:DD:EE:03',
      uuid: 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825',
      major: 100,
      minor: 3,
      deviceName: '待分配手環 #1',
      type: DeviceType.IBEACON,
      batteryLevel: 100,
      isActive: true,
    },
  });
  console.log(`✅ 未分配 Beacon 建立成功: ${device3.deviceName} (${device3.macAddress})`);

  // ==================== 6. 建立測試訊號記錄 ====================
  console.log('\n📊 建立測試訊號記錄...');
  
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  await prisma.log.create({
    data: {
      deviceId: device1.id,
      gatewayId: gateway2.id,
      macAddress: device1.macAddress,
      rssi: -65,
      distance: 2.5,
      proximity: 'NEAR',
      uuid: device1.uuid,
      major: device1.major,
      minor: device1.minor,
      latitude: 25.0335,
      longitude: 121.5658,
      accuracy: 10,
      timestamp: oneHourAgo,
    },
  });
  
  await prisma.log.create({
    data: {
      deviceId: device2.id,
      gatewayId: gateway2.id,
      macAddress: device2.macAddress,
      rssi: -55,
      distance: 1.2,
      proximity: 'IMMEDIATE',
      uuid: device2.uuid,
      major: device2.major,
      minor: device2.minor,
      latitude: 25.0335,
      longitude: 121.5658,
      accuracy: 8,
      timestamp: now,
    },
  });
  console.log('✅ 測試訊號記錄建立成功');

  // ==================== 7. 建立測試行蹤記錄 ====================
  console.log('\n🗺️  建立測試行蹤記錄...');
  
  await prisma.locationLog.create({
    data: {
      elderId: elder1.id,
      latitude: 25.0335,
      longitude: 121.5658,
      accuracy: 10,
      activity: 'walking',
      address: '大愛社區活動中心',
      sourceType: 'beacon_scan',
      sourceGatewayId: gateway2.id,
      timestamp: oneHourAgo,
    },
  });
  
  await prisma.locationLog.create({
    data: {
      elderId: elder2.id,
      latitude: 25.0335,
      longitude: 121.5658,
      accuracy: 8,
      activity: 'still',
      address: '大愛社區活動中心',
      sourceType: 'beacon_scan',
      sourceGatewayId: gateway2.id,
      timestamp: now,
    },
  });
  console.log('✅ 測試行蹤記錄建立成功');

  // ==================== 8. 建立 App 用戶和社區成員 ====================
  console.log('\n📱 建立 App 用戶...');
  
  // 建立測試 App 用戶
  const appUserPassword = await bcrypt.hash('password123', 10);
  
  const appUser1 = await prisma.appUser.create({
    data: {
      email: 'user1@app.com',
      name: '王小明',
      password: appUserPassword,
      phone: '0922-111-222',
      isActive: true,
    },
  });
  console.log(`✅ App 用戶建立成功: ${appUser1.email}`);

  const appUser2 = await prisma.appUser.create({
    data: {
      email: 'user2@app.com',
      name: '李小華',
      password: appUserPassword,
      phone: '0922-333-444',
      isActive: true,
    },
  });
  console.log(`✅ App 用戶建立成功: ${appUser2.email}`);

  const appUser3 = await prisma.appUser.create({
    data: {
      email: 'user3@app.com',
      name: '張志工',
      password: appUserPassword,
      phone: '0922-555-666',
      isActive: true,
    },
  });
  console.log(`✅ App 用戶建立成功: ${appUser3.email}`);

  // 建立社區成員關係
  console.log('\n👥 建立社區成員關係...');
  
  const member1 = await prisma.tenantMember.create({
    data: {
      tenantId: testTenant.id,
      appUserId: appUser1.id,
      role: TenantMemberRole.ADMIN,  // 社區管理員
      status: MembershipStatus.APPROVED,
      processedAt: new Date(),
      processedBy: superAdmin.id,
      processedByType: 'backend',
    },
  });
  console.log(`✅ 社區管理員成員建立: ${appUser1.name} (${testTenant.name})`);

  const member2 = await prisma.tenantMember.create({
    data: {
      tenantId: testTenant.id,
      appUserId: appUser2.id,
      role: TenantMemberRole.MEMBER,  // 一般成員
      status: MembershipStatus.APPROVED,
      processedAt: new Date(),
      processedBy: appUser1.id,
      processedByType: 'app',
    },
  });
  console.log(`✅ 一般成員建立: ${appUser2.name} (${testTenant.name})`);

  // 建立待批准的成員
  const member3 = await prisma.tenantMember.create({
    data: {
      tenantId: testTenant.id,
      appUserId: appUser3.id,
      role: TenantMemberRole.MEMBER,
      status: MembershipStatus.PENDING,  // 待批准
      requestedAt: new Date(),
    },
  });
  console.log(`✅ 待批准成員建立: ${appUser3.name} (${testTenant.name} - 待批准)`);

  // ==================== 完成 ====================
  console.log('\n✨ 資料庫初始化完成！\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 測試帳號資訊：');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🔐 Super Admin:');
  console.log(`   Email: ${superAdmin.email}`);
  console.log('   Password: admin123456');
  console.log('\n🔐 社區管理員 (大愛社區):');
  console.log(`   Email: ${tenantAdmin.email}`);
  console.log('   Password: admin123');
  console.log('\n🔐 一般人員 (大愛社區):');
  console.log(`   Email: ${staff.email}`);
  console.log('   Password: staff123');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📱 App 測試帳號：');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🔐 App 社區管理員:');
  console.log(`   Email: ${appUser1.email}`);
  console.log('   Password: password123');
  console.log('   狀態: 已批准 (管理員)');
  console.log('\n🔐 App 一般成員:');
  console.log(`   Email: ${appUser2.email}`);
  console.log('   Password: password123');
  console.log('   狀態: 已批准 (一般成員)');
  console.log('\n🔐 App 待批准成員:');
  console.log(`   Email: ${appUser3.email}`);
  console.log('   Password: password123');
  console.log('   狀態: 待批准');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 資料統計：');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   社區數量: 1`);
  console.log(`   後台管理員數量: 3`);
  console.log(`   App 用戶數量: 3`);
  console.log(`   社區成員數量: 3 (2 已批准, 1 待批准)`);
  console.log(`   Gateway 數量: 3`);
  console.log(`   長者數量: 2`);
  console.log(`   Beacon 數量: 3 (2 已分配, 1 未分配)`);
  console.log(`   訊號記錄: 2`);
  console.log(`   行蹤記錄: 2`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ 資料庫初始化失敗:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
