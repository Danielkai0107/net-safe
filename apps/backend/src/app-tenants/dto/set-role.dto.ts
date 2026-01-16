import { IsEnum, IsNotEmpty } from 'class-validator';
import { TenantMemberRole } from '@prisma/client';

export class SetRoleDto {
  @IsEnum(TenantMemberRole)
  @IsNotEmpty()
  role: TenantMemberRole;
}
