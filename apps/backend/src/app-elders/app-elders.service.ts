import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateElderDto } from '../elders/dto/create-elder.dto';

@Injectable()
export class AppEldersService {
  constructor(private databaseService: DatabaseService) {}

  async create(userId: string, createElderDto: CreateElderDto) {
    // 檢查用戶是否為該社區的管理員
    const membership = await this.databaseService.tenantMember.findFirst({
      where: {
        appUserId: userId,
        tenantId: createElderDto.tenantId,
        status: 'APPROVED',
        role: 'ADMIN',
      },
    });

    if (!membership) {
      throw new ForbiddenException('您沒有權限在此社區新增長輩');
    }

    // 如果有指定設備，先檢查設備是否可用
    if (createElderDto.deviceId) {
      const device = await this.databaseService.device.findUnique({
        where: { id: createElderDto.deviceId },
      });

      if (!device) {
        throw new NotFoundException('設備不存在');
      }

      if (device.tenantId !== createElderDto.tenantId) {
        throw new ForbiddenException('該設備不屬於此社區');
      }

      if (device.elderId) {
        throw new ForbiddenException('該設備已被其他長輩使用');
      }
    }

    // 創建長輩
    const elder = await this.databaseService.elder.create({
      data: {
        tenantId: createElderDto.tenantId,
        name: createElderDto.name,
        phone: createElderDto.phone,
        address: createElderDto.address,
        emergencyContact: createElderDto.emergencyContact,
        emergencyPhone: createElderDto.emergencyPhone,
        photo: createElderDto.photo,
        notes: createElderDto.notes,
        status: createElderDto.status || 'ACTIVE',
        inactiveThresholdHours: createElderDto.inactiveThresholdHours || 24,
        isActive: true,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        device: true,
      },
    });

    // 如果有指定設備，綁定設備到長輩
    if (createElderDto.deviceId) {
      await this.databaseService.device.update({
        where: { id: createElderDto.deviceId },
        data: { elderId: elder.id },
      });
    }

    return elder;
  }

  async getAvailableDevices(userId: string, tenantId: string) {
    // 檢查用戶是否為該社區的管理員
    const membership = await this.databaseService.tenantMember.findFirst({
      where: {
        appUserId: userId,
        tenantId,
        status: 'APPROVED',
        role: 'ADMIN',
      },
    });

    if (!membership) {
      throw new ForbiddenException('您沒有權限查看此社區的設備');
    }

    // 獲取該社區未綁定的設備
    const devices = await this.databaseService.device.findMany({
      where: {
        tenantId,
        elderId: null,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return devices;
  }

  async findAll(userId: string, paginationDto?: PaginationDto) {
    // 獲取用戶所屬的社區
    const memberships = await this.databaseService.tenantMember.findMany({
      where: {
        appUserId: userId,
        status: 'APPROVED',
      },
      select: { tenantId: true },
    });

    const tenantIds = memberships.map((m) => m.tenantId);

    if (tenantIds.length === 0) {
      return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    }

    const { page = 1, limit = 20 } = paginationDto || {};
    const skip = (page - 1) * limit;

    const [elders, total] = await Promise.all([
      this.databaseService.elder.findMany({
        where: {
          tenantId: { in: tenantIds },
          isActive: true,
        },
        include: {
          device: {
            select: {
              id: true,
              macAddress: true,
              deviceName: true,
              batteryLevel: true,
              lastSeen: true,
            },
          },
          tenant: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.databaseService.elder.count({
        where: {
          tenantId: { in: tenantIds },
          isActive: true,
        },
      }),
    ]);

    return {
      data: elders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, elderId: string) {
    // 檢查用戶是否有權限查看此長輩
    const elder = await this.databaseService.elder.findUnique({
      where: { id: elderId },
      include: {
        device: true,
        tenant: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!elder) {
      throw new NotFoundException('長輩不存在');
    }

    const membership = await this.databaseService.tenantMember.findFirst({
      where: {
        appUserId: userId,
        tenantId: elder.tenantId,
        status: 'APPROVED',
      },
    });

    if (!membership) {
      throw new ForbiddenException('您沒有權限查看此長輩資訊');
    }

    return elder;
  }

  async getLocations(
    userId: string,
    elderId: string,
    startDate?: Date,
    endDate?: Date,
    page = 1,
    limit = 50,
  ) {
    // 檢查權限
    await this.findOne(userId, elderId);

    const where: any = { elderId };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const skip = (page - 1) * limit;

    const [locations, total] = await Promise.all([
      this.databaseService.locationLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      this.databaseService.locationLog.count({ where }),
    ]);

    return {
      data: locations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
