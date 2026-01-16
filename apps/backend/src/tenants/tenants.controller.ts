import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { AssignDevicesDto } from './dto/assign-devices.dto';
import { SetMemberRoleDto } from './dto/set-member-role.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@repo/database';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() createTenantDto: CreateTenantDto): Promise<any> {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  findAll(@Query() paginationDto: PaginationDto): Promise<any> {
    return this.tenantsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<any> {
    return this.tenantsService.findOne(id);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string): Promise<any> {
    return this.tenantsService.getStats(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto): Promise<any> {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string): Promise<any> {
    return this.tenantsService.remove(id);
  }

  // ==================== App 成員管理 ====================

  @Get(':id/app-members')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async getAppMembers(@Param('id') id: string): Promise<any> {
    const members = await this.tenantsService.getAppMembers(id);
    return {
      data: members,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':tenantId/members/:memberId/approve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async approveMember(
    @Param('tenantId') tenantId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: any,
  ): Promise<any> {
    const result = await this.tenantsService.approveMemberByBackend(
      tenantId,
      memberId,
      user.userId,
    );
    return {
      data: result,
      message: 'Member approved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':tenantId/members/:memberId/reject')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async rejectMember(
    @Param('tenantId') tenantId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: any,
    @Body('rejectionReason') rejectionReason?: string,
  ): Promise<any> {
    const result = await this.tenantsService.rejectMemberByBackend(
      tenantId,
      memberId,
      user.userId,
      rejectionReason,
    );
    return {
      data: result,
      message: 'Member rejected successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':tenantId/members/:memberId/set-role')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async setMemberRole(
    @Param('tenantId') tenantId: string,
    @Param('memberId') memberId: string,
    @Body() setMemberRoleDto: SetMemberRoleDto,
  ): Promise<any> {
    const result = await this.tenantsService.setMemberRole(
      tenantId,
      memberId,
      setMemberRoleDto.role,
    );
    return {
      data: result,
      message: 'Member role updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':tenantId/members/add')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async addMember(
    @Param('tenantId') tenantId: string,
    @Body() addMemberDto: AddMemberDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    const result = await this.tenantsService.addMemberByBackend(
      tenantId,
      addMemberDto.appUserId,
      user.userId,
      addMemberDto.role || 'MEMBER',
    );
    return {
      data: result,
      message: 'Member added successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':tenantId/members/:memberId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async removeMember(
    @Param('tenantId') tenantId: string,
    @Param('memberId') memberId: string,
  ): Promise<any> {
    const result = await this.tenantsService.removeMember(tenantId, memberId);
    return {
      data: result,
      message: 'Member removed successfully',
      timestamp: new Date().toISOString(),
    };
  }

  // ==================== 設備分配管理 ====================

  @Get(':id/devices')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async getDevices(@Param('id') id: string): Promise<any> {
    const devices = await this.tenantsService.getDevices(id);
    return {
      data: devices,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/devices/assign')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async assignDevices(
    @Param('id') id: string,
    @Body() assignDevicesDto: AssignDevicesDto,
  ): Promise<any> {
    const result = await this.tenantsService.assignDevices(
      id,
      assignDevicesDto.deviceIds,
    );
    return {
      data: result,
      message: `${result.assignedCount} devices assigned successfully`,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':tenantId/devices/:deviceId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async removeDevice(
    @Param('tenantId') tenantId: string,
    @Param('deviceId') deviceId: string,
  ): Promise<any> {
    const result = await this.tenantsService.removeDevice(tenantId, deviceId);
    return {
      data: result,
      message: 'Device removed from tenant successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
