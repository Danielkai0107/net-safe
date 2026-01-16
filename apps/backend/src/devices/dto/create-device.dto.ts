import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { DeviceType } from '@prisma/client';

export class CreateDeviceDto {
  @IsString()
  @IsOptional()
  elderId?: string;

  @IsString()
  @IsNotEmpty()
  macAddress: string;

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

  @IsOptional()
  isActive?: boolean;
}
