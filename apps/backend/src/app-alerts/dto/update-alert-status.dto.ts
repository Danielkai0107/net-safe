import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AlertStatus } from '@prisma/client';

export class UpdateAlertStatusDto {
  @IsEnum(AlertStatus)
  @IsNotEmpty()
  status: AlertStatus;

  @IsString()
  @IsOptional()
  resolution?: string;
}
