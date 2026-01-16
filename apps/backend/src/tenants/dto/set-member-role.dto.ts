import { IsIn } from 'class-validator';

export class SetMemberRoleDto {
  @IsIn(['MEMBER', 'ADMIN'])
  role: 'MEMBER' | 'ADMIN';
}
