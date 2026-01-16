import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAppUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
