import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class TenantsService {
  constructor(private databaseService: DatabaseService) {}

  async create(createTenantDto: CreateTenantDto): Promise<any> {
    // Check if code already exists
    const existing = await this.databaseService.tenant.findUnique({
      where: { code: createTenantDto.code },
    });

    if (existing) {
      throw new ConflictException('Tenant code already exists');
    }

    return this.databaseService.tenant.create({
      data: createTenantDto,
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<any> {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const skip = (page - 1) * limit;

      const [tenants, total] = await Promise.all([
        this.databaseService.tenant.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                elders: true,
                gateways: true,
                users: true,
              },
            },
          },
        }),
        this.databaseService.tenant.count(),
      ]);

      return {
        data: tenants,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error in TenantsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<any> {
    const tenant = await this.databaseService.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            elders: true,
            gateways: true,
            users: true,
            alerts: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<any> {
    await this.findOne(id); // Check if exists

    // If updating code, check uniqueness
    if (updateTenantDto.code) {
      const existing = await this.databaseService.tenant.findFirst({
        where: {
          code: updateTenantDto.code,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Tenant code already exists');
      }
    }

    return this.databaseService.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  async remove(id: string): Promise<any> {
    await this.findOne(id); // Check if exists

    return this.databaseService.tenant.delete({
      where: { id },
    });
  }

  async getStats(id: string): Promise<any> {
    const tenant = await this.findOne(id);

    const [
      totalElders,
      activeElders,
      totalDevices,
      totalGateways,
      pendingAlerts,
      todayLogs,
    ] = await Promise.all([
      this.databaseService.elder.count({
        where: { tenantId: id },
      }),
      this.databaseService.elder.count({
        where: { tenantId: id, status: 'ACTIVE' },
      }),
      this.databaseService.device.count({
        where: { elder: { tenantId: id } },
      }),
      this.databaseService.gateway.count({
        where: { tenantId: id },
      }),
      this.databaseService.alert.count({
        where: { tenantId: id, status: 'PENDING' },
      }),
      this.databaseService.log.count({
        where: {
          timestamp: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
          device: {
            elder: {
              tenantId: id,
            },
          },
        },
      }),
    ]);

    return {
      tenant,
      stats: {
        totalElders,
        activeElders,
        totalDevices,
        totalGateways,
        pendingAlerts,
        todayLogs,
      },
    };
  }

  // ==================== App 成員管理 ====================

  async getAppMembers(tenantId: string): Promise<any> {
    await this.findOne(tenantId); // Check if tenant exists

    const members = await this.databaseService.tenantMember.findMany({
      where: { tenantId },
      include: {
        appUser: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            avatar: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });

    return members;
  }

  async approveMemberByBackend(
    tenantId: string,
    memberId: string,
    approverId: string,
  ): Promise<any> {
    const membership = await this.databaseService.tenantMember.findUnique({
      where: { id: memberId },
    });

    if (!membership || membership.tenantId !== tenantId) {
      throw new NotFoundException('Member not found');
    }

    if (membership.status !== 'PENDING') {
      throw new ConflictException('Member already processed');
    }

    return this.databaseService.tenantMember.update({
      where: { id: memberId },
      data: {
        status: 'APPROVED',
        processedAt: new Date(),
        processedBy: approverId,
        processedByType: 'backend',
      },
      include: {
        appUser: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async rejectMemberByBackend(
    tenantId: string,
    memberId: string,
    rejecterId: string,
    rejectionReason?: string,
  ): Promise<any> {
    const membership = await this.databaseService.tenantMember.findUnique({
      where: { id: memberId },
    });

    if (!membership || membership.tenantId !== tenantId) {
      throw new NotFoundException('Member not found');
    }

    if (membership.status !== 'PENDING') {
      throw new ConflictException('Member already processed');
    }

    return this.databaseService.tenantMember.update({
      where: { id: memberId },
      data: {
        status: 'REJECTED',
        processedAt: new Date(),
        processedBy: rejecterId,
        processedByType: 'backend',
        rejectionReason,
      },
      include: {
        appUser: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async setMemberRole(
    tenantId: string,
    memberId: string,
    role: 'MEMBER' | 'ADMIN',
  ): Promise<any> {
    const membership = await this.databaseService.tenantMember.findUnique({
      where: { id: memberId },
    });

    if (!membership || membership.tenantId !== tenantId) {
      throw new NotFoundException('Member not found');
    }

    if (membership.status !== 'APPROVED') {
      throw new ConflictException('Can only set role for approved members');
    }

    return this.databaseService.tenantMember.update({
      where: { id: memberId },
      data: {
        role,
      },
      include: {
        appUser: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async addMemberByBackend(
    tenantId: string,
    appUserId: string,
    addedBy: string,
    role: 'MEMBER' | 'ADMIN' = 'MEMBER',
  ): Promise<any> {
    // 檢查社區是否存在
    await this.findOne(tenantId);

    // 檢查 App 用戶是否存在
    const appUser = await this.databaseService.appUser.findUnique({
      where: { id: appUserId },
    });

    if (!appUser) {
      throw new NotFoundException('App user not found');
    }

    if (!appUser.isActive) {
      throw new ConflictException('App user is not active');
    }

    // 檢查是否已經是成員
    const existingMembership = await this.databaseService.tenantMember.findFirst({
      where: {
        tenantId,
        appUserId,
      },
    });

    if (existingMembership) {
      if (existingMembership.status === 'APPROVED') {
        throw new ConflictException('User is already a member of this tenant');
      } else if (existingMembership.status === 'PENDING') {
        throw new ConflictException('User already has a pending request for this tenant');
      } else if (existingMembership.status === 'REJECTED') {
        // 如果之前被拒絕，可以重新添加
        return this.databaseService.tenantMember.update({
          where: { id: existingMembership.id },
          data: {
            status: 'APPROVED',
            role,
            processedAt: new Date(),
            processedBy: addedBy,
            processedByType: 'backend',
            rejectionReason: null,
          },
          include: {
            appUser: {
              select: {
                id: true,
                email: true,
                name: true,
                phone: true,
              },
            },
          },
        });
      }
    }

    // 創建新的成員關係
    return this.databaseService.tenantMember.create({
      data: {
        tenantId,
        appUserId,
        role,
        status: 'APPROVED',
        requestedAt: new Date(),
        processedAt: new Date(),
        processedBy: addedBy,
        processedByType: 'backend',
      },
      include: {
        appUser: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
      },
    });
  }

  async removeMember(tenantId: string, memberId: string): Promise<any> {
    const membership = await this.databaseService.tenantMember.findUnique({
      where: { id: memberId },
    });

    if (!membership || membership.tenantId !== tenantId) {
      throw new NotFoundException('Member not found');
    }

    // 刪除成員關係
    return this.databaseService.tenantMember.delete({
      where: { id: memberId },
    });
  }

  // ==================== 設備分配管理 ====================

  async getDevices(tenantId: string): Promise<any> {
    await this.findOne(tenantId); // Check if tenant exists

    const devices = await this.databaseService.device.findMany({
      where: { tenantId },
      include: {
        elder: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return devices;
  }

  async assignDevices(tenantId: string, deviceIds: string[]): Promise<any> {
    await this.findOne(tenantId); // Check if tenant exists

    // 檢查設備是否已被其他社區分配
    const alreadyAssigned = await this.databaseService.device.findMany({
      where: {
        id: { in: deviceIds },
        tenantId: { not: null },
        NOT: { tenantId },
      },
      include: {
        tenant: {
          select: {
            name: true,
          },
        },
      },
    });

    if (alreadyAssigned.length > 0) {
      const conflictInfo = alreadyAssigned.map(
        (d) => `${d.macAddress} (${d.tenant?.name})`,
      );
      throw new ConflictException(
        `以下設備已被其他社區分配: ${conflictInfo.join(', ')}`,
      );
    }

    // 批量更新設備的 tenantId
    const result = await this.databaseService.device.updateMany({
      where: {
        id: { in: deviceIds },
      },
      data: {
        tenantId,
      },
    });

    return {
      assignedCount: result.count,
      deviceIds,
    };
  }

  async removeDevice(tenantId: string, deviceId: string): Promise<any> {
    const device = await this.databaseService.device.findUnique({
      where: { id: deviceId },
      include: {
        elder: true,
      },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (device.tenantId !== tenantId) {
      throw new ConflictException('Device does not belong to this tenant');
    }

    if (device.elderId) {
      throw new ConflictException(
        'Cannot remove device that is assigned to an elder. Please unassign the device from the elder first.',
      );
    }

    // 將設備從社區移除（設為未分配）
    return this.databaseService.device.update({
      where: { id: deviceId },
      data: {
        tenantId: null,
      },
    });
  }
}
