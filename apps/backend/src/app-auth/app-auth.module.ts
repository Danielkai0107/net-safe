import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppAuthService } from './app-auth.service';
import { AppAuthController } from './app-auth.controller';
import { JwtAppStrategy } from './strategies/jwt-app.strategy';
import { LocalAppStrategy } from './strategies/local-app.strategy';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_APP_SECRET || 'app-secret-key-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AppAuthController],
  providers: [AppAuthService, JwtAppStrategy, LocalAppStrategy],
  exports: [AppAuthService],
})
export class AppAuthModule {}
