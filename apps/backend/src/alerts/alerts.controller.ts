import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FindAlertsDto } from './dto/find-alerts.dto';
import { ResolveAlertDto } from './dto/resolve-alert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  findAll(@Query() findAlertsDto: FindAlertsDto): Promise<any> {
    const paginationDto: PaginationDto = {
      page: findAlertsDto.page,
      limit: findAlertsDto.limit,
    };
    return this.alertsService.findAll(
      paginationDto,
      findAlertsDto.tenantId,
      findAlertsDto.elderId,
      findAlertsDto.type,
      findAlertsDto.status,
    );
  }

  @Get('stats')
  getStats(@Query('tenantId') tenantId?: string): Promise<any> {
    return this.alertsService.getStats(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<any> {
    return this.alertsService.findOne(id);
  }

  @Patch(':id/resolve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.STAFF)
  resolve(
    @Param('id') id: string,
    @Body() resolveAlertDto: ResolveAlertDto,
  ): Promise<any> {
    return this.alertsService.resolve(id, resolveAlertDto);
  }

  @Patch(':id/dismiss')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.STAFF)
  dismiss(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<any> {
    return this.alertsService.dismiss(id, userId);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string): Promise<any> {
    return this.alertsService.remove(id);
  }
}
