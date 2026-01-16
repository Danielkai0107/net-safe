import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // 跳過 App 相關路由（/api/app/*），讓 JwtAppAuthGuard 處理
    const request = context.switchToHttp().getRequest();
    if (request.url?.startsWith('/api/app/')) {
      console.log('[JwtAuthGuard] Skipping App route:', request.url);
      return true;
    }

    return super.canActivate(context);
  }
}
