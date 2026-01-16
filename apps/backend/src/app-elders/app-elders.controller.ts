import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AppEldersService } from './app-elders.service';
import { JwtAppAuthGuard } from '../app-auth/guards/jwt-app-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateElderDto } from '../elders/dto/create-elder.dto';

@Controller('app/elders')
@UseGuards(JwtAppAuthGuard)
export class AppEldersController {
  constructor(private readonly appEldersService: AppEldersService) {}

  @Post()
  async create(@Request() req, @Body() createElderDto: CreateElderDto) {
    const elder = await this.appEldersService.create(req.user.userId, createElderDto);
    return {
      data: elder,
      message: '長輩新增成功',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  async findAll(@Request() req, @Query() paginationDto: PaginationDto) {
    const result = await this.appEldersService.findAll(req.user.userId, paginationDto);
    return {
      ...result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('available-devices')
  async getAvailableDevices(@Request() req, @Query('tenantId') tenantId: string) {
    const devices = await this.appEldersService.getAvailableDevices(req.user.userId, tenantId);
    return {
      data: devices,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const elder = await this.appEldersService.findOne(req.user.userId, id);
    return {
      data: elder,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/locations')
  async getLocations(
    @Request() req,
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.appEldersService.getLocations(
      req.user.userId,
      id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
    return {
      ...result,
      timestamp: new Date().toISOString(),
    };
  }
}
