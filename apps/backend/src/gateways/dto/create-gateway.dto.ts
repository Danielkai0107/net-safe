import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsObject } from 'class-validator';
import { GatewayType } from '@prisma/client';

export class CreateGatewayDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(GatewayType)
  @IsOptional()
  type?: GatewayType;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsObject()
  @IsOptional()
  deviceInfo?: any;

  @IsOptional()
  isActive?: boolean;
}
