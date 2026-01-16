import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AlertStatus, ElderStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private databaseService: DatabaseService) {}

  /**
   * 總覽統計（Super Admin）
   */
  async getOverview(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalTenants,
      totalElders,
      activeElders,
      totalDevices,
      totalGateways,
      pendingAlerts,
      todayLogs,
      todayAlerts,
    ] = await Promise.all([
      this.databaseService.tenant.count({ where: { isActive: true } }),
      this.databaseService.elder.count(),
      this.databaseService.elder.count({
        where: { status: ElderStatus.ACTIVE, isActive: true },
      }),
      this.databaseService.device.count({ where: { isActive: true } }),
      this.databaseService.gateway.count({ where: { isActive: true } }),
      this.databaseService.alert.count({
        where: { status: AlertStatus.PENDING },
      }),
      this.databaseService.log.count({
        where: { timestamp: { gte: today } },
      }),
      this.databaseService.alert.count({
        where: { triggeredAt: { gte: today } },
      }),
    ]);

    return {
      tenants: {
        total: totalTenants,
      },
      elders: {
        total: totalElders,
        active: activeElders,
      },
      devices: {
        total: totalDevices,
      },
      gateways: {
        total: totalGateways,
      },
      alerts: {
        pending: pendingAlerts,
        today: todayAlerts,
      },
      logs: {
        today: todayLogs,
      },
    };
  }

  /**
   * 社區統計
   */
  async getTenantStats(tenantId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      tenant,
      totalElders,
      activeElders,
      totalDevices,
      totalGateways,
      pendingAlerts,
      todayLogs,
      todayAlerts,
      eldersByStatus,
      gatewaysByType,
    ] = await Promise.all([
      this.databaseService.tenant.findUnique({
        where: { id: tenantId },
      }),
      this.databaseService.elder.count({
        where: { tenantId },
      }),
      this.databaseService.elder.count({
        where: { tenantId, status: ElderStatus.ACTIVE, isActive: true },
      }),
      this.databaseService.device.count({
        where: { elder: { tenantId } },
      }),
      this.databaseService.gateway.count({
        where: { tenantId },
      }),
      this.databaseService.alert.count({
        where: { tenantId, status: AlertStatus.PENDING },
      }),
      this.databaseService.log.count({
        where: {
          timestamp: { gte: today },
          device: { elder: { tenantId } },
        },
      }),
      this.databaseService.alert.count({
        where: {
          tenantId,
          triggeredAt: { gte: today },
        },
      }),
      this.databaseService.elder.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
      }),
      this.databaseService.gateway.groupBy({
        by: ['type'],
        where: { tenantId },
        _count: true,
      }),
    ]);

    return {
      tenant,
      stats: {
        elders: {
          total: totalElders,
          active: activeElders,
          byStatus: eldersByStatus,
        },
        devices: {
          total: totalDevices,
        },
        gateways: {
          total: totalGateways,
          byType: gatewaysByType,
        },
        alerts: {
          pending: pendingAlerts,
          today: todayAlerts,
        },
        logs: {
          today: todayLogs,
        },
      },
    };
  }

  /**
   * 活動趨勢（最近 7 天）
   */
  async getActivityTrend(tenantId?: string, days: number = 7): Promise<any> {
    const result = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const where: any = {
        timestamp: {
          gte: date,
          lt: nextDate,
        },
      };

      if (tenantId) {
        where.device = { elder: { tenantId } };
      }

      const count = await this.databaseService.log.count({ where });

      result.push({
        date: date.toISOString().split('T')[0],
        count,
      });
    }

    return result;
  }

  /**
   * 警報摘要
   */
  async getAlertsSummary(tenantId?: string): Promise<any> {
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;

    const [
      recentAlerts,
      alertsByType,
      alertsBySeverity,
      alertsByStatus,
    ] = await Promise.all([
      this.databaseService.alert.findMany({
        where,
        take: 10,
        orderBy: { triggeredAt: 'desc' },
        include: {
          elder: {
            select: { id: true, name: true },
          },
          gateway: {
            select: { id: true, name: true },
          },
        },
      }),
      this.databaseService.alert.groupBy({
        by: ['type'],
        where,
        _count: true,
        orderBy: { _count: { type: 'desc' } },
      }),
      this.databaseService.alert.groupBy({
        by: ['severity'],
        where,
        _count: true,
      }),
      this.databaseService.alert.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
    ]);

    return {
      recentAlerts,
      byType: alertsByType,
      bySeverity: alertsBySeverity,
      byStatus: alertsByStatus,
    };
  }
}
