import { IsNotEmpty, IsString } from 'class-validator';

export class JoinTenantDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;
}
