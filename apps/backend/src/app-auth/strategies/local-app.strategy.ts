import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AppAuthService } from '../app-auth.service';

@Injectable()
export class LocalAppStrategy extends PassportStrategy(Strategy, 'local-app') {
  constructor(private appAuthService: AppAuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.appAuthService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('帳號或密碼錯誤');
    }
    return user;
  }
}
