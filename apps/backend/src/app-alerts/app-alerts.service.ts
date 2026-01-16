import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PushNotificationsService } from '../push-notifications/push-notifications.service';
import { AssignAlertDto } from './dto/assign-alert.dto';
import { UpdateAlertStatusDto } from './dto/update-alert-status.dto';
import { AlertStatus } from '@prisma/client';

@Injectable()
export class AppAlertsService {
  private readonly logger = new Logger(AppAlertsService.name);

  constructor(
    private databaseService: DatabaseService,
    private pushNotificationsService: PushNotificationsService,
  ) {}

  // 我的警報清單（只顯示分配給我的，排除已婉拒和已撤銷的）
  async getMyAlerts(userId: string, status?: AlertStatus) {
    const where: any = {
      assignments: {
        some: {
          appUserId: userId,
          status: {
            in: ['PENDING', 'ACCEPTED'], // 只顯示等待回覆和已接受的
          },
        },
      },
    };

    if (status) {
      where.status = status;
    }

    const alerts = await this.databaseService.alert.findMany({
      where,
      include: {
        elder: {
          select: {
            id: true,
            name: true,
            phone: true,
            photo: true,
          },
        },
        gateway: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
        assignments: {
          where: { appUserId: userId },
        },
      },
      orderBy: { triggeredAt: 'desc' },
      take: 100,
    });

    return alerts;
  }

  // 所有警報（管理員專用）
  async getAllAlerts(userId: string, tenantId?: string, status?: AlertStatus) {
    // 檢查用戶是否為管理員
    const adminMemberships = await this.databaseService.tenantMember.findMany({
      where: {
        appUserId: userId,
        status: 'APPROVED',
        role: 'ADMIN',
      },
      select: { tenantId: true },
    });

    if (adminMemberships.length === 0) {
      throw new ForbiddenException('您沒有管理員權限');
    }

    const adminTenantIds = adminMemberships.map((m) => m.tenantId);

    const where: any = {
      tenantId: tenantId || { in: adminTenantIds },
    };

    if (status) {
      where.status = status;
    }

    const alerts = await this.databaseService.alert.findMany({
      where,
      include: {
        elder: {
          select: {
            id: true,
            name: true,
            phone: true,
            photo: true,
          },
        },
        gateway: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        assignments: {
          include: {
            appUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { triggeredAt: 'desc' },
      take: 100,
    });

    return alerts;
  }

  // 警報詳情
  async getAlert(userId: string, alertId: string) {
    const alert = await this.databaseService.alert.findUnique({
      where: { id: alertId },
      include: {
        elder: {
          select: {
            id: true,
            name: true,
            phone: true,
            photo: true,
            emergencyContact: true,
            emergencyPhone: true,
          },
        },
        gateway: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
        assignments: {
          include: {
            appUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException('警報不存在');
    }

    // 檢查用戶是否有權限查看
    const hasPermission =
      alert.assignments.some((a) => a.appUserId === userId) ||
      (await this.isAdmin(userId, alert.tenantId));

    if (!hasPermission) {
      throw new ForbiddenException('您沒有權限查看此警報');
    }

    return alert;
  }

  // 接受警報（接單）
  async acceptAlert(userId: string, alertId: string) {
    const alert = await this.databaseService.alert.findUnique({
      where: { id: alertId },
      include: {
        assignments: true,
      },
    });

    if (!alert) {
      throw new NotFoundException('警報不存在');
    }

    // 檢查用戶是否被分配此警報
    const assignment = alert.assignments.find((a) => a.appUserId === userId);
    if (!assignment) {
      throw new ForbiddenException('您未被分配處理此警報');
    }

    // 檢查此分配是否已被婉拒
    if (assignment.status === 'DECLINED') {
      throw new ConflictException('您已婉拒此警報');
    }

    // 檢查是否已被其他人接單
    if (alert.acceptedBy && alert.acceptedBy !== userId) {
      throw new ConflictException('此警報已被其他人接單');
    }

    // 使用事務更新：1) 更新警報狀態 2) 更新此分配為已接受 3) 撤銷其他人的分配
    await this.databaseService.$transaction([
      // 1. 更新警報狀態
      this.databaseService.alert.update({
        where: { id: alertId },
        data: {
          acceptedBy: userId,
          acceptedAt: new Date(),
          status: AlertStatus.NOTIFIED,
        },
      }),
      // 2. 更新此用戶的分配為已接受
      this.databaseService.alertAssignment.update({
        where: { id: assignment.id },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      }),
      // 3. 撤銷其他人的待處理分配
      this.databaseService.alertAssignment.updateMany({
        where: {
          alertId,
          appUserId: { not: userId },
          status: 'PENDING',
        },
        data: {
          status: 'CANCELLED',
          respondedAt: new Date(),
        },
      }),
    ]);

    return { success: true, message: '警報已接受，其他分配已撤銷' };
  }

  // 更新警報狀態
  async updateAlertStatus(
    userId: string,
    alertId: string,
    updateDto: UpdateAlertStatusDto,
  ) {
    const alert = await this.databaseService.alert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      throw new NotFoundException('警報不存在');
    }

    // 只有接單人員或管理員可以更新狀態
    const isAcceptor = alert.acceptedBy === userId;
    const isAdmin = await this.isAdmin(userId, alert.tenantId);

    if (!isAcceptor && !isAdmin) {
      throw new ForbiddenException('只有接單人員或管理員可以更新狀態');
    }

    const updateData: any = {
      status: updateDto.status,
    };

    if (updateDto.status === AlertStatus.RESOLVED) {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = userId;
      updateData.resolution = updateDto.resolution || 'Resolved by app user';
    }

    return this.databaseService.alert.update({
      where: { id: alertId },
      data: updateData,
    });
  }

  // 分配警報（管理員專用）
  async assignAlert(
    userId: string,
    alertId: string,
    assignDto: AssignAlertDto,
  ) {
    const alert = await this.databaseService.alert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      throw new NotFoundException('警報不存在');
    }

    // 檢查是否為管理員
    if (!(await this.isAdmin(userId, alert.tenantId))) {
      throw new ForbiddenException('只有管理員可以分配警報');
    }

    // 檢查目標用戶是否為該社區成員
    const members = await this.databaseService.tenantMember.findMany({
      where: {
        appUserId: { in: assignDto.appUserIds },
        tenantId: alert.tenantId,
        status: 'APPROVED',
      },
    });

    if (members.length !== assignDto.appUserIds.length) {
      throw new ConflictException('部分用戶不是該社區的成員');
    }

    // 刪除舊的分配記錄（如果有）
    await this.databaseService.alertAssignment.deleteMany({
      where: { alertId },
    });

    // 創建新的分配記錄
    await this.databaseService.alertAssignment.createMany({
      data: assignDto.appUserIds.map((appUserId) => ({
        alertId,
        appUserId,
        status: 'PENDING',
      })),
    });

    // 發送推送通知給被分配的成員
    try {
      await this.pushNotificationsService.sendAlertNotification(alertId);
    } catch (error) {
      // 推送通知失敗不影響分配流程
      this.logger.error(`Failed to send push notification for alert ${alertId}: ${error.message}`);
    }

    return { success: true, assignedCount: assignDto.appUserIds.length };
  }

  // 婉拒警報
  async declineAlert(userId: string, alertId: string) {
    // 查找分配記錄
    const assignment = await this.databaseService.alertAssignment.findFirst({
      where: {
        alertId,
        appUserId: userId,
      },
      include: {
        alert: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('您未被分配此警報');
    }

    // 檢查是否已經回應過
    if (assignment.status !== 'PENDING') {
      throw new ConflictException(`您已${assignment.status === 'ACCEPTED' ? '接受' : '婉拒'}此警報`);
    }

    // 更新分配狀態為已婉拒
    await this.databaseService.alertAssignment.update({
      where: { id: assignment.id },
      data: {
        status: 'DECLINED',
        respondedAt: new Date(),
      },
    });

    // 檢查是否還有其他待處理的分配
    const remainingAssignments = await this.databaseService.alertAssignment.count({
      where: {
        alertId,
        status: 'PENDING',
      },
    });

    // 如果沒有人願意接單，可以選擇將警報標記為 DISMISSED 或保持原狀
    // 這裡保持原狀，讓管理員可以重新分配

    return { 
      success: true, 
      message: '已婉拒警報',
      remainingAssignments 
    };
  }

  // 檢查是否為管理員
  private async isAdmin(userId: string, tenantId: string): Promise<boolean> {
    const membership = await this.databaseService.tenantMember.findFirst({
      where: {
        appUserId: userId,
        tenantId,
        status: 'APPROVED',
        role: 'ADMIN',
      },
    });

    return !!membership;
  }
}
