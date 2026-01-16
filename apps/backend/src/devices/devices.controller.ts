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
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';

@Controller('devices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  create(@Body() createDeviceDto: CreateDeviceDto): Promise<any> {
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto): Promise<any> {
    return this.devicesService.findAll(paginationDto);
  }

  /**
   * 獲取所有已註冊設備的 MAC 地址列表（Public API - 供守護者模式使用）
   */
  @Public()
  @Get('registered/mac-addresses')
  getRegisteredMacAddresses(): Promise<any> {
    return this.devicesService.getRegisteredMacAddresses();
  }

  @Get('mac/:macAddress')
  findByMacAddress(@Param('macAddress') macAddress: string): Promise<any> {
    return this.devicesService.findByMacAddress(macAddress);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<any> {
    return this.devicesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ): Promise<any> {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string): Promise<any> {
    return this.devicesService.remove(id);
  }
}
