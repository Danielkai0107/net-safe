import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class DevicesService {
  constructor(private databaseService: DatabaseService) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<any> {
    // Convert empty strings to undefined for optional fields
    const sanitizedDto = {
      ...createDeviceDto,
      elderId: createDeviceDto.elderId?.trim() || undefined,
      uuid: createDeviceDto.uuid?.trim() || undefined,
      deviceName: createDeviceDto.deviceName?.trim() || undefined,
    };
    
    // Check if MAC address already exists
    const existing = await this.databaseService.device.findUnique({
      where: { macAddress: sanitizedDto.macAddress },
    });

    if (existing) {
      throw new ConflictException('MAC Address already exists');
    }

    // If elderId is provided, check if elder already has a device
    if (sanitizedDto.elderId) {
      const elderExists = await this.databaseService.elder.findUnique({
        where: { id: sanitizedDto.elderId },
      });
      
      if (!elderExists) {
        throw new NotFoundException('Elder not found');
      }
      
      const elderDevice = await this.databaseService.device.findUnique({
        where: { elderId: sanitizedDto.elderId },
      });

      if (elderDevice) {
        throw new ConflictException('Elder already has a device');
      }
    }

    return this.databaseService.device.create({
      data: sanitizedDto,
      include: {
        elder: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<any> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [devices, total] = await Promise.all([
      this.databaseService.device.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          elder: {
            select: { id: true, name: true, tenantId: true },
          },
          lastGateway: {
            select: { id: true, name: true, location: true },
          },
        },
      }),
      this.databaseService.device.count(),
    ]);

    return {
      data: devices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const device = await this.databaseService.device.findUnique({
      where: { id },
      include: {
        elder: true,
        lastGateway: true,
      },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return device;
  }

  async findByMacAddress(macAddress: string): Promise<any> {
    const device = await this.databaseService.device.findUnique({
      where: { macAddress },
      include: {
        elder: {
          include: {
            tenant: true,
          },
        },
      },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return device;
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto): Promise<any> {
    await this.findOne(id);
    
    // Convert empty strings to undefined for optional fields
    const sanitizedDto: UpdateDeviceDto = {};
    if (updateDeviceDto.elderId !== undefined) {
      sanitizedDto.elderId = updateDeviceDto.elderId?.trim() || undefined;
    }
    if (updateDeviceDto.macAddress !== undefined) {
      sanitizedDto.macAddress = updateDeviceDto.macAddress;
    }
    if (updateDeviceDto.uuid !== undefined) {
      sanitizedDto.uuid = updateDeviceDto.uuid?.trim() || undefined;
    }
    if (updateDeviceDto.deviceName !== undefined) {
      sanitizedDto.deviceName = updateDeviceDto.deviceName?.trim() || undefined;
    }
    if (updateDeviceDto.major !== undefined) {
      sanitizedDto.major = updateDeviceDto.major;
    }
    if (updateDeviceDto.minor !== undefined) {
      sanitizedDto.minor = updateDeviceDto.minor;
    }
    if (updateDeviceDto.type !== undefined) {
      sanitizedDto.type = updateDeviceDto.type;
    }
    if (updateDeviceDto.batteryLevel !== undefined) {
      sanitizedDto.batteryLevel = updateDeviceDto.batteryLevel;
    }
    if (updateDeviceDto.isActive !== undefined) {
      sanitizedDto.isActive = updateDeviceDto.isActive;
    }

    // If updating MAC address, check uniqueness
    if (sanitizedDto.macAddress) {
      const existing = await this.databaseService.device.findFirst({
        where: {
          macAddress: sanitizedDto.macAddress,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('MAC Address already exists');
      }
    }

    // If updating elderId, check if elder already has a device
    if (sanitizedDto.elderId !== undefined) {
      if (sanitizedDto.elderId) {
        // Check if elder exists
        const elderExists = await this.databaseService.elder.findUnique({
          where: { id: sanitizedDto.elderId },
        });
        
        if (!elderExists) {
          throw new NotFoundException('Elder not found');
        }
        
        // Assigning to an elder - check if elder already has a device
        const elderDevice = await this.databaseService.device.findFirst({
          where: {
            elderId: sanitizedDto.elderId,
            NOT: { id },
          },
        });

        if (elderDevice) {
          throw new ConflictException('Elder already has a device');
        }
      }
      // If elderId is null/empty, it's unassigning - that's fine
    }

    return this.databaseService.device.update({
      where: { id },
      data: sanitizedDto,
      include: {
        elder: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async remove(id: string): Promise<any> {
    await this.findOne(id);

    return this.databaseService.device.delete({
      where: { id },
    });
  }

  /**
   * 獲取所有已註冊且活躍的設備 MAC 地址列表
   * Public API - 供守護者模式使用
   */
  async getRegisteredMacAddresses(): Promise<any> {
    const devices = await this.databaseService.device.findMany({
      where: {
        isActive: true,
        elderId: { not: null }, // 只返回已綁定給長者的設備
      },
      select: {
        macAddress: true,
      },
    });

    const macAddresses = devices.map((device) => device.macAddress);

    return {
      data: macAddresses,
      count: macAddresses.length,
      timestamp: new Date().toISOString(),
    };
  }
}
