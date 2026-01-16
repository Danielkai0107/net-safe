import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class JwtAppStrategy extends PassportStrategy(Strategy, 'jwt-app') {
  constructor(private databaseService: DatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_APP_SECRET || 'app-secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
    console.log('[JwtAppStrategy] Validating payload:', { 
      sub: payload.sub, 
      email: payload.email,
      exp: payload.exp ? new Date(payload.exp * 1000) : null 
    });
    
    const appUser = await this.databaseService.appUser.findUnique({
      where: { id: payload.sub },
      include: {
        tenantMemberships: {
          where: { status: 'APPROVED' },
          include: {
            tenant: true,
          },
        },
      },
    });

    console.log('[JwtAppStrategy] User found:', { 
      found: !!appUser, 
      isActive: appUser?.isActive,
      membershipsCount: appUser?.tenantMemberships?.length 
    });

    if (!appUser || !appUser.isActive) {
      throw new UnauthorizedException('用戶不存在或已被停用');
    }

    return {
      userId: appUser.id,
      email: appUser.email,
      name: appUser.name,
      tenantMemberships: appUser.tenantMemberships,
    };
  }
}
