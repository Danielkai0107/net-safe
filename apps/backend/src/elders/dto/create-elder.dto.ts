import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsDateString } from 'class-validator';
import { ElderStatus } from '@prisma/client';

export class CreateElderDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @IsString()
  @IsOptional()
  emergencyPhone?: string;

  @IsString()
  @IsOptional()
  photo?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(ElderStatus)
  @IsOptional()
  status?: ElderStatus;

  @IsInt()
  @IsOptional()
  inactiveThresholdHours?: number;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsOptional()
  isActive?: boolean;
}
