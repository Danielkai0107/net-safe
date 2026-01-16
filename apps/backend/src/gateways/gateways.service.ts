import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GatewayType } from '@prisma/client';

@Injectable()
export class GatewaysService {
  constructor(private databaseService: DatabaseService) {}

  async create(createGatewayDto: CreateGatewayDto): Promise<any> {
    // Check if serial number already exists
    const existing = await this.databaseService.gateway.findUnique({
      where: { serialNumber: createGatewayDto.serialNumber },
    });

    if (existing) {
      throw new ConflictException('Serial number already exists');
    }

    return this.databaseService.gateway.create({
      data: createGatewayDto,
      include: {
        tenant: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  async findAll(
    paginationDto: PaginationDto,
    tenantId?: string,
    type?: GatewayType,
  ): Promise<any> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (type) where.type = type;

    const [gateways, total] = await Promise.all([
      this.databaseService.gateway.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: {
            select: { id: true, name: true, code: true },
          },
          _count: {
            select: {
              logs: true,
              alerts: true,
            },
          },
        },
      }),
      this.databaseService.gateway.count({ where }),
    ]);

    return {
      data: gateways,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const gateway = await this.databaseService.gateway.findUnique({
      where: { id },
      include: {
        tenant: true,
        _count: {
          select: {
            logs: true,
            alerts: true,
          },
        },
      },
    });

    if (!gateway) {
      throw new NotFoundException('Gateway not found');
    }

    return gateway;
  }

  async update(id: string, updateGatewayDto: UpdateGatewayDto): Promise<any> {
    await this.findOne(id);

    // If updating serial number, check uniqueness
    if (updateGatewayDto.serialNumber) {
      const existing = await this.databaseService.gateway.findFirst({
        where: {
          serialNumber: updateGatewayDto.serialNumber,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Serial number already exists');
      }
    }

    return this.databaseService.gateway.update({
      where: { id },
      data: updateGatewayDto,
    });
  }

  async remove(id: string): Promise<any> {
    await this.findOne(id);

    return this.databaseService.gateway.delete({
      where: { id },
    });
  }
}
