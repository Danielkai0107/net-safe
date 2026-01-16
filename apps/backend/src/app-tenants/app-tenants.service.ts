import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ProcessMemberDto } from './dto/process-member.dto';
import { SetRoleDto } from './dto/set-role.dto';

@Injectable()
export class AppTenantsService {
  constructor(private databaseService: DatabaseService) {}

  // 列出所有可加入的社區
  async findAll() {
    const tenants = await this.databaseService.tenant.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        address: true,
        contactPerson: true,
        contactPhone: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return tenants;
  }

  // 我加入的社區（只包含已批准的）
  async getMyTenants(userId: string) {
    const memberships = await this.databaseService.tenantMember.findMany({
      where: {
        appUserId: userId,
        status: 'APPROVED',
      },
      include: {
        tenant: {
          select: {
            id: true,
            code: true,
            name: true,
            address: true,
            contactPerson: true,
            contactPhone: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return memberships.map((m) => ({
      ...m.tenant,
      role: m.role,
      joinedAt: m.createdAt,
      membershipId: m.id,
    }));
  }

  // 我的所有社區申請記錄（包含所有狀態）
  async getMyMemberships(userId: string) {
    const memberships = await this.databaseService.tenantMember.findMany({
      where: {
        appUserId: userId,
      },
      include: {
        tenant: {
          select: {
            id: true,
            code: true,
            name: true,
            address: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return memberships.map((m) => ({
      id: m.tenantId,
      tenantId: m.tenantId,
      membershipId: m.id,
      status: m.status,
      role: m.role,
      requestedAt: m.requestedAt,
      ...m.tenant,
    }));
  }

  // 申請加入社區
  async joinTenant(userId: string, tenantId: string) {
    // 檢查社區是否存在
    const tenant = await this.databaseService.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant || !tenant.isActive) {
      throw new NotFoundException('社區不存在或已停用');
    }

    // 檢查是否已經申請過
    const existingMembership = await this.databaseService.tenantMember.findUnique({
      where: {
        tenantId_appUserId: {
          tenantId,
          appUserId: userId,
        },
      },
    });

    if (existingMembership) {
      if (existingMembership.status === 'APPROVED') {
        throw new ConflictException('您已經是該社區的成員');
      }
      if (existingMembership.status === 'PENDING') {
        throw new ConflictException('您的申請正在審核中');
      }
      if (existingMembership.status === 'REJECTED') {
        // 允許重新申請
        const updated = await this.databaseService.tenantMember.update({
          where: { id: existingMembership.id },
          data: {
            status: 'PENDING',
            requestedAt: new Date(),
            processedAt: null,
            processedBy: null,
            processedByType: null,
            rejectionReason: null,
          },
        });
        return updated;
      }
    }

    // 創建新的申請
    const membership = await this.databaseService.tenantMember.create({
      data: {
        tenantId,
        appUserId: userId,
        role: 'MEMBER',
        status: 'PENDING',
      },
      include: {
        tenant: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return membership;
  }

  // 社區成員清單（管理員專用）
  async getMembers(tenantId: string, userId: string) {
    // 檢查用戶是否為該社區的管理員
    const adminMembership = await this.databaseService.tenantMember.findFirst({
      where: {
        tenantId,
        appUserId: userId,
        status: 'APPROVED',
        role: 'ADMIN',
      },
    });

    if (!adminMembership) {
      throw new ForbiddenException('您沒有權限查看成員清單');
    }

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
            createdAt: true,
          },
        },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });

    return members;
  }

  // 批准成員
  async approveMember(
    tenantId: string,
    memberId: string,
    approverId: string,
    processMemberDto?: ProcessMemberDto,
  ) {
    const membership = await this.databaseService.tenantMember.findUnique({
      where: { id: memberId },
    });

    if (!membership || membership.tenantId !== tenantId) {
      throw new NotFoundException('找不到該成員申請');
    }

    if (membership.status !== 'PENDING') {
      throw new ConflictException('該申請已經被處理過');
    }

    const updated = await this.databaseService.tenantMember.update({
      where: { id: memberId },
      data: {
        status: 'APPROVED',
        processedAt: new Date(),
        processedBy: approverId,
        processedByType: 'app',
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

    return updated;
  }

  // 拒絕成員
  async rejectMember(
    tenantId: string,
    memberId: string,
    rejecterId: string,
    processMemberDto: ProcessMemberDto,
  ) {
    const membership = await this.databaseService.tenantMember.findUnique({
      where: { id: memberId },
    });

    if (!membership || membership.tenantId !== tenantId) {
      throw new NotFoundException('找不到該成員申請');
    }

    if (membership.status !== 'PENDING') {
      throw new ConflictException('該申請已經被處理過');
    }

    const updated = await this.databaseService.tenantMember.update({
      where: { id: memberId },
      data: {
        status: 'REJECTED',
        processedAt: new Date(),
        processedBy: rejecterId,
        processedByType: 'app',
        rejectionReason: processMemberDto.rejectionReason,
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

    return updated;
  }

  // 設定成員角色
  async setMemberRole(
    tenantId: string,
    memberId: string,
    setRoleDto: SetRoleDto,
  ) {
    const membership = await this.databaseService.tenantMember.findUnique({
      where: { id: memberId },
    });

    if (!membership || membership.tenantId !== tenantId) {
      throw new NotFoundException('找不到該成員');
    }

    if (membership.status !== 'APPROVED') {
      throw new ConflictException('只能設定已批准成員的角色');
    }

    const updated = await this.databaseService.tenantMember.update({
      where: { id: memberId },
      data: { role: setRoleDto.role },
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

    return updated;
  }

  // 獲取待批准成員清單（管理員專用）
  async getPendingMembers(tenantId: string, userId: string) {
    // 檢查用戶是否為該社區的管理員
    const adminMembership = await this.databaseService.tenantMember.findFirst({
      where: {
        tenantId,
        appUserId: userId,
        status: 'APPROVED',
        role: 'ADMIN',
      },
    });

    if (!adminMembership) {
      throw new ForbiddenException('您沒有權限查看待批准清單');
    }

    const pendingMembers = await this.databaseService.tenantMember.findMany({
      where: {
        tenantId,
        status: 'PENDING',
      },
      include: {
        appUser: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });

    return pendingMembers;
  }
}
