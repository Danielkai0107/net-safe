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
import { EldersService } from './elders.service';
import { CreateElderDto } from './dto/create-elder.dto';
import { UpdateElderDto } from './dto/update-elder.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('elders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EldersController {
  constructor(private readonly eldersService: EldersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  create(@Body() createElderDto: CreateElderDto): Promise<any> {
    return this.eldersService.create(createElderDto);
  }

  @Get('available-devices')
  getAvailableDevices(@Query('tenantId') tenantId: string): Promise<any> {
    return this.eldersService.getAvailableDevices(tenantId);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('tenantId') tenantId?: string,
  ): Promise<any> {
    return this.eldersService.findAll(paginationDto, tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<any> {
    return this.eldersService.findOne(id);
  }

  @Get(':id/activity')
  getActivity(
    @Param('id') id: string,
    @Query('hours') hours?: string,
  ): Promise<any> {
    return this.eldersService.getActivity(id, hours ? parseInt(hours) : 24);
  }

  @Get(':id/location')
  getLocation(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    return this.eldersService.getLocation(id, limit ? parseInt(limit) : 50);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateElderDto: UpdateElderDto,
  ): Promise<any> {
    return this.eldersService.update(id, updateElderDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string): Promise<any> {
    return this.eldersService.remove(id);
  }
}
