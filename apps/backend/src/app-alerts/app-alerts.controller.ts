import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AppAlertsService } from './app-alerts.service';
import { JwtAppAuthGuard } from '../app-auth/guards/jwt-app-auth.guard';
import { AssignAlertDto } from './dto/assign-alert.dto';
import { UpdateAlertStatusDto } from './dto/update-alert-status.dto';
import { AlertStatus } from '@prisma/client';

@Controller('app/alerts')
@UseGuards(JwtAppAuthGuard)
export class AppAlertsController {
  constructor(private readonly appAlertsService: AppAlertsService) {}

  @Get()
  async getMyAlerts(@Request() req, @Query('status') status?: AlertStatus) {
    const alerts = await this.appAlertsService.getMyAlerts(req.user.userId, status);
    return {
      data: alerts,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('all')
  async getAllAlerts(
    @Request() req,
    @Query('tenantId') tenantId?: string,
    @Query('status') status?: AlertStatus,
  ) {
    const alerts = await this.appAlertsService.getAllAlerts(req.user.userId, tenantId, status);
    return {
      data: alerts,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  async getAlert(@Request() req, @Param('id') id: string) {
    const alert = await this.appAlertsService.getAlert(req.user.userId, id);
    return {
      data: alert,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/accept')
  async acceptAlert(@Request() req, @Param('id') id: string) {
    const result = await this.appAlertsService.acceptAlert(req.user.userId, id);
    return {
      data: result,
      message: '警報已接受',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateAlertStatusDto,
  ) {
    const result = await this.appAlertsService.updateAlertStatus(req.user.userId, id, updateDto);
    return {
      data: result,
      message: '警報狀態已更新',
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/assign')
  async assignAlert(@Request() req, @Param('id') id: string, @Body() assignDto: AssignAlertDto) {
    const result = await this.appAlertsService.assignAlert(req.user.userId, id, assignDto);
    return {
      data: result,
      message: '警報已分配',
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/decline')
  async declineAlert(@Request() req, @Param('id') id: string) {
    const result = await this.appAlertsService.declineAlert(req.user.userId, id);
    return {
      data: result,
      message: '已婉拒警報',
      timestamp: new Date().toISOString(),
    };
  }
}
