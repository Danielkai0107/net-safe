import { IsString, IsIn, IsOptional } from 'class-validator';

export class AddMemberDto {
  @IsString()
  appUserId: string;

  @IsOptional()
  @IsIn(['MEMBER', 'ADMIN'])
  role?: 'MEMBER' | 'ADMIN';
}
