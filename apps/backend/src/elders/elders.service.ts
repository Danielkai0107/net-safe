import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateElderDto } from './dto/create-elder.dto';
import { UpdateElderDto } from './dto/update-elder.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class EldersService {
  constructor(private databaseService: DatabaseService) {}

  async create(createElderDto: CreateElderDto): Promise<any> {
    const { deviceId, ...elderData } = createElderDto as any;

    // If deviceId is provided, check if device exists and is available
    if (deviceId) {
      const device = await this.databaseService.device.findUnique({
        where: { id: deviceId },
      });

      if (!device) {
        throw new NotFoundException('Device not found');
      }

      if (device.elderId) {
        throw new ConflictException('Device is already assigned to another elder');
      }

      // 驗證設備屬於該社區
      if (device.tenantId !== elderData.tenantId) {
        throw new ConflictException('Device does not belong to this tenant. Please assign device to tenant first.');
      }
    }

    const elder = await this.databaseService.elder.create({
      data: {
        ...elderData,
        lastActivityAt: new Date(),
      },
      include: {
        device: true,
        tenant: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    // If deviceId is provided, assign device to elder
    if (deviceId) {
      await this.databaseService.device.update({
        where: { id: deviceId },
        data: { elderId: elder.id },
      });

      // Reload elder with device
      return this.databaseService.elder.findUnique({
        where: { id: elder.id },
        include: {
          device: true,
          tenant: {
            select: { id: true, name: true, code: true },
          },
        },
      });
    }

    return elder;
  }

  async findAll(paginationDto: PaginationDto, tenantId?: string): Promise<any> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;

    const [elders, total] = await Promise.all([
      this.databaseService.elder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          device: true,
          tenant: {
            select: { id: true, name: true, code: true },
          },
          _count: {
            select: {
              alerts: true,
              locationLogs: true,
            },
          },
        },
      }),
      this.databaseService.elder.count({ where }),
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

  async findOne(id: string): Promise<any> {
    const elder = await this.databaseService.elder.findUnique({
      where: { id },
      include: {
        device: true,
        tenant: true,
        _count: {
          select: {
            alerts: true,
            locationLogs: true,
          },
        },
      },
    });

    if (!elder) {
      throw new NotFoundException('Elder not found');
    }

    return elder;
  }

  async update(id: string, updateElderDto: UpdateElderDto): Promise<any> {
    await this.findOne(id);

    const { deviceId, ...elderData } = updateElderDto as any;

    // If deviceId is provided, handle device assignment
    if (deviceId !== undefined) {
      if (deviceId) {
        // Assigning a device
        const device = await this.databaseService.device.findUnique({
          where: { id: deviceId },
        });

        if (!device) {
          throw new NotFoundException('Device not found');
        }

        if (device.elderId && device.elderId !== id) {
          throw new ConflictException('Device is already assigned to another elder');
        }

        // Unassign current device if exists
        const currentDevice = await this.databaseService.device.findUnique({
          where: { elderId: id },
        });

        if (currentDevice && currentDevice.id !== deviceId) {
          await this.databaseService.device.update({
            where: { id: currentDevice.id },
            data: { elderId: null },
          });
        }

        // Assign new device
        await this.databaseService.device.update({
          where: { id: deviceId },
          data: { elderId: id },
        });
      } else {
        // Unassigning device (deviceId is empty string or null)
        const currentDevice = await this.databaseService.device.findUnique({
          where: { elderId: id },
        });

        if (currentDevice) {
          await this.databaseService.device.update({
            where: { id: currentDevice.id },
            data: { elderId: null },
          });
        }
      }
    }

    return this.databaseService.elder.update({
      where: { id },
      data: elderData,
      include: {
        device: true,
        tenant: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  async remove(id: string): Promise<any> {
    await this.findOne(id);

    return this.databaseService.elder.delete({
      where: { id },
    });
  }

  async getActivity(id: string, hours: number = 24): Promise<any> {
    const elder = await this.findOne(id);
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const logs = await this.databaseService.log.findMany({
      where: {
        device: { elderId: id },
        timestamp: { gte: startTime },
      },
      include: {
        gateway: {
          select: { id: true, name: true, location: true },
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    return {
      elder,
      activity: {
        hours,
        count: logs.length,
        logs,
      },
    };
  }

  async getLocation(id: string, limit: number = 50): Promise<any> {
    const elder = await this.findOne(id);

    const locations = await this.databaseService.locationLog.findMany({
      where: { elderId: id },
      take: limit,
      orderBy: { timestamp: 'desc' },
    });

    return {
      elder,
      locations,
    };
  }

  // 獲取可用設備（該社區已分配但未綁定長輩的設備）
  async getAvailableDevices(tenantId: string): Promise<any> {
    if (!tenantId) {
      throw new ConflictException('Tenant ID is required');
    }

    // 查詢該社區已分配但未綁定長輩的設備
    const devices = await this.databaseService.device.findMany({
      where: {
        tenantId: tenantId,  // 屬於該社區
        elderId: null,        // 未綁定長輩
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: devices,
      timestamp: new Date().toISOString(),
    };
  }
}
