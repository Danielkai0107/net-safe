import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppUsersService } from './app-users.service';
import { UpdateAppUserDto } from './dto/update-app-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('app-users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppUsersController {
  constructor(private readonly appUsersService: AppUsersService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async findAll(@Query() paginationDto: PaginationDto) {
    const result = await this.appUsersService.findAll(paginationDto);
    return {
      ...result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('selection/available')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async getAvailableForSelection() {
    const users = await this.appUsersService.getAvailableForSelection();
    return {
      data: users,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async findOne(@Param('id') id: string) {
    const appUser = await this.appUsersService.findOne(id);
    return {
      data: appUser,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async update(@Param('id') id: string, @Body() updateDto: UpdateAppUserDto) {
    const appUser = await this.appUsersService.update(id, updateDto);
    return {
      data: appUser,
      message: 'App user updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id/toggle-active')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async toggleActive(@Param('id') id: string) {
    const appUser = await this.appUsersService.toggleActive(id);
    return {
      data: appUser,
      message: 'App user status toggled successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    const appUser = await this.appUsersService.remove(id);
    return {
      data: appUser,
      message: 'App user deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
