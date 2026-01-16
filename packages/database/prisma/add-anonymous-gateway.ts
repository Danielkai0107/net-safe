import { PrismaClient, GatewayType } from '@prisma/client';

const prisma = new PrismaClient();

async function addAnonymousGateway() {
  console.log('🔧 建立匿名守護者預設接收點...\n');

  try {
    // 檢查是否已存在
    const existing = await prisma.gateway.findUnique({
      where: { serialNumber: 'ANONYMOUS-GUARDIAN-DEFAULT' },
    });

    if (existing) {
      console.log('✅ 預設接收點已存在');
      console.log(`   ID: ${existing.id}`);
      console.log(`   序列號: ${existing.serialNumber}`);
      console.log(`   名稱: ${existing.name}`);
      console.log(`   類型: ${existing.type}`);
      return existing;
    }

    // 查詢第一個社區
    const tenant = await prisma.tenant.findFirst({
      where: { isActive: true },
    });

    if (!tenant) {
      throw new Error('找不到可用的社區，請先執行 pnpm db:seed 建立測試資料');
    }

    console.log(`📍 綁定到社區: ${tenant.name} (${tenant.code})\n`);

    // 建立新的預設接收點
    const gateway = await prisma.gateway.create({
      data: {
        tenantId: tenant.id,
        serialNumber: 'ANONYMOUS-GUARDIAN-DEFAULT',
        name: '匿名守護者預設接收點',
        location: '移動式接收點（匿名用戶）',
        type: GatewayType.GENERAL,
        isActive: true,
      },
    });

    console.log('✅ 預設接收點建立成功！');
    console.log(`   ID: ${gateway.id}`);
    console.log(`   序列號: ${gateway.serialNumber}`);
    console.log(`   名稱: ${gateway.name}`);
    console.log(`   類型: ${gateway.type}`);
    
    return gateway;
  } catch (error) {
    console.error('❌ 建立失敗:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addAnonymousGateway();
