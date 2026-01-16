import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @Roles(UserRole.SUPER_ADMIN)
  getOverview(): Promise<any> {
    return this.dashboardService.getOverview();
  }

  @Get('tenant/:id')
  getTenantStats(@Query('id') id: string): Promise<any> {
    return this.dashboardService.getTenantStats(id);
  }

  @Get('activity')
  getActivityTrend(
    @Query('tenantId') tenantId?: string,
    @Query('days') days?: string,
  ): Promise<any> {
    return this.dashboardService.getActivityTrend(
      tenantId,
      days ? parseInt(days) : 7,
    );
  }

  @Get('alerts-summary')
  getAlertsSummary(@Query('tenantId') tenantId?: string): Promise<any> {
    return this.dashboardService.getAlertsSummary(tenantId);
  }
}
