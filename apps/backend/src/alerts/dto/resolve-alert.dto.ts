import { IsString, IsNotEmpty } from 'class-validator';

export class ResolveAlertDto {
  @IsString()
  @IsNotEmpty()
  resolvedBy: string;

  @IsString()
  @IsNotEmpty()
  resolution: string;
}
