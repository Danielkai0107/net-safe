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
import { GatewaysService } from './gateways.service';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';
import { FindGatewaysDto } from './dto/find-gateways.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('gateways')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GatewaysController {
  constructor(private readonly gatewaysService: GatewaysService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  create(@Body() createGatewayDto: CreateGatewayDto): Promise<any> {
    return this.gatewaysService.create(createGatewayDto);
  }

  @Get()
  findAll(@Query() findGatewaysDto: FindGatewaysDto): Promise<any> {
    const paginationDto: PaginationDto = {
      page: findGatewaysDto.page,
      limit: findGatewaysDto.limit,
    };
    return this.gatewaysService.findAll(
      paginationDto,
      findGatewaysDto.tenantId,
      findGatewaysDto.type,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<any> {
    return this.gatewaysService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateGatewayDto: UpdateGatewayDto,
  ): Promise<any> {
    return this.gatewaysService.update(id, updateGatewayDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string): Promise<any> {
    return this.gatewaysService.remove(id);
  }
}
