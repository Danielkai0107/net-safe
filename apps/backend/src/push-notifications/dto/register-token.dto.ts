import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export class RegisterTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsObject()
  @IsOptional()
  deviceInfo?: any;
}
