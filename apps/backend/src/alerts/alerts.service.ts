import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ResolveAlertDto } from './dto/resolve-alert.dto';
import { AlertType, AlertStatus } from '@prisma/client';

@Injectable()
export class AlertsService {
  constructor(private databaseService: DatabaseService) {}

  async findAll(
    paginationDto: PaginationDto,
    tenantId?: string,
    elderId?: string,
    type?: AlertType,
    status?: AlertStatus,
  ): Promise<any> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (elderId) where.elderId = elderId;
    if (type) where.type = type;
    if (status) where.status = status;

    const [alerts, total] = await Promise.all([
      this.databaseService.alert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { triggeredAt: 'desc' },
        include: {
          elder: {
            select: { id: true, name: true, phone: true },
          },
          gateway: {
            select: { id: true, name: true, location: true },
          },
          tenant: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
      this.databaseService.alert.count({ where }),
    ]);

    return {
      data: alerts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const alert = await this.databaseService.alert.findUnique({
      where: { id },
      include: {
        elder: true,
        gateway: true,
        tenant: true,
      },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    return alert;
  }

  async resolve(id: string, resolveAlertDto: ResolveAlertDto): Promise<any> {
    await this.findOne(id);

    return this.databaseService.alert.update({
      where: { id },
      data: {
        status: AlertStatus.RESOLVED,
        resolvedAt: new Date(),
        resolvedBy: resolveAlertDto.resolvedBy,
        resolution: resolveAlertDto.resolution,
      },
    });
  }

  async dismiss(id: string, userId: string): Promise<any> {
    await this.findOne(id);

    return this.databaseService.alert.update({
      where: { id },
      data: {
        status: AlertStatus.DISMISSED,
        resolvedAt: new Date(),
        resolvedBy: userId,
        resolution: 'Dismissed by user',
      },
    });
  }

  async remove(id: string): Promise<any> {
    await this.findOne(id);

    return this.databaseService.alert.delete({
      where: { id },
    });
  }

  async getStats(tenantId?: string): Promise<any> {
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;

    const [
      total,
      pending,
      resolved,
      byType,
      bySeverity,
    ] = await Promise.all([
      this.databaseService.alert.count({ where }),
      this.databaseService.alert.count({
        where: { ...where, status: AlertStatus.PENDING },
      }),
      this.databaseService.alert.count({
        where: { ...where, status: AlertStatus.RESOLVED },
      }),
      this.databaseService.alert.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),
      this.databaseService.alert.groupBy({
        by: ['severity'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      pending,
      resolved,
      byType,
      bySeverity,
    };
  }
}
