import { IsOptional, IsString } from 'class-validator';

export class ProcessMemberDto {
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
