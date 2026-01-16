import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class TenantAdminGuard implements CanActivate {
  constructor(private databaseService: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const tenantId = request.params?.tenantId || request.body?.tenantId;

    if (!userId || !tenantId) {
      throw new ForbiddenException('無效的請求');
    }

    // 檢查用戶是否為該社區的管理員
    const membership = await this.databaseService.tenantMember.findFirst({
      where: {
        appUserId: userId,
        tenantId: tenantId,
        status: 'APPROVED',
        role: 'ADMIN',
      },
    });

    if (!membership) {
      throw new ForbiddenException('您沒有權限執行此操作');
    }

    return true;
  }
}
