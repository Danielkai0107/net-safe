import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AppTenantsService } from './app-tenants.service';
import { JwtAppAuthGuard } from '../app-auth/guards/jwt-app-auth.guard';
import { TenantAdminGuard } from './guards/tenant-admin.guard';
import { ProcessMemberDto } from './dto/process-member.dto';
import { SetRoleDto } from './dto/set-role.dto';

@Controller('app/tenants')
@UseGuards(JwtAppAuthGuard)
export class AppTenantsController {
  constructor(private readonly appTenantsService: AppTenantsService) {}

  @Get()
  async findAll() {
    const tenants = await this.appTenantsService.findAll();
    return {
      data: tenants,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('my')
  async getMyTenants(@Request() req) {
    const tenants = await this.appTenantsService.getMyTenants(req.user.userId);
    return {
      data: tenants,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('memberships')
  async getMyMemberships(@Request() req) {
    const memberships = await this.appTenantsService.getMyMemberships(req.user.userId);
    return {
      data: memberships,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/join')
  async joinTenant(@Param('id') tenantId: string, @Request() req) {
    const result = await this.appTenantsService.joinTenant(req.user.userId, tenantId);
    return {
      data: result,
      message: '申請已提交，請等待審核',
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':tenantId/members')
  @UseGuards(TenantAdminGuard)
  async getMembers(@Param('tenantId') tenantId: string, @Request() req) {
    const members = await this.appTenantsService.getMembers(tenantId, req.user.userId);
    return {
      data: members,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':tenantId/members/pending')
  @UseGuards(TenantAdminGuard)
  async getPendingMembers(@Param('tenantId') tenantId: string, @Request() req) {
    const members = await this.appTenantsService.getPendingMembers(tenantId, req.user.userId);
    return {
      data: members,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':tenantId/members/:memberId/approve')
  @UseGuards(TenantAdminGuard)
  async approveMember(
    @Param('tenantId') tenantId: string,
    @Param('memberId') memberId: string,
    @Request() req,
    @Body() processMemberDto?: ProcessMemberDto,
  ) {
    const result = await this.appTenantsService.approveMember(
      tenantId,
      memberId,
      req.user.userId,
      processMemberDto,
    );
    return {
      data: result,
      message: '成員已批准',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':tenantId/members/:memberId/reject')
  @UseGuards(TenantAdminGuard)
  async rejectMember(
    @Param('tenantId') tenantId: string,
    @Param('memberId') memberId: string,
    @Request() req,
    @Body() processMemberDto: ProcessMemberDto,
  ) {
    const result = await this.appTenantsService.rejectMember(
      tenantId,
      memberId,
      req.user.userId,
      processMemberDto,
    );
    return {
      data: result,
      message: '成員已拒絕',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':tenantId/members/:memberId/set-role')
  @UseGuards(TenantAdminGuard)
  async setMemberRole(
    @Param('tenantId') tenantId: string,
    @Param('memberId') memberId: string,
    @Body() setRoleDto: SetRoleDto,
  ) {
    const result = await this.appTenantsService.setMemberRole(tenantId, memberId, setRoleDto);
    return {
      data: result,
      message: '角色已更新',
      timestamp: new Date().toISOString(),
    };
  }
}
