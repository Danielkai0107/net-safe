import { IsString, IsOptional, IsEnum, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { DeviceType } from '@prisma/client';

export class UpdateDeviceDto {
  @IsString()
  @IsOptional()
  elderId?: string;

  @IsString()
  @IsOptional()
  macAddress?: string;

  @IsString()
  @IsOptional()
  uuid?: string;

  @IsInt()
  @IsOptional()
  major?: number;

  @IsInt()
  @IsOptional()
  minor?: number;

  @IsString()
  @IsOptional()
  deviceName?: string;

  @IsEnum(DeviceType)
  @IsOptional()
  type?: DeviceType;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  batteryLevel?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
