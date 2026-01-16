import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AlertType, AlertStatus } from '@prisma/client';

export class FindAlertsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsString()
  elderId?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      return value.toUpperCase();
    }
    return value;
  })
  @IsEnum(AlertType, {
    message: 'type must be one of: BOUNDARY, INACTIVE, FIRST_ACTIVITY, LOW_BATTERY, EMERGENCY',
  })
  type?: AlertType;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      return value.toUpperCase();
    }
    return value;
  })
  @IsEnum(AlertStatus, {
    message: 'status must be one of: PENDING, NOTIFIED, RESOLVED, DISMISSED',
  })
  status?: AlertStatus;
}
