import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AssignDevicesDto {
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  deviceIds: string[];
}
