import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AssignAlertDto {
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  appUserIds: string[];
}
