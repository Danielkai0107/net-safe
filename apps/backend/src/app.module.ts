import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AppAuthModule } from './app-auth/app-auth.module';
import { AppTenantsModule } from './app-tenants/app-tenants.module';
import { AppEldersModule } from './app-elders/app-elders.module';
import { AppAlertsModule } from './app-alerts/app-alerts.module';
import { AppUsersModule } from './app-users/app-users.module';
import { PushNotificationsModule } from './push-notifications/push-notifications.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { EldersModule } from './elders/elders.module';
import { DevicesModule } from './devices/devices.module';
import { GatewaysModule } from './gateways/gateways.module';
import { LogsModule } from './logs/logs.module';
import { AlertsModule } from './alerts/alerts.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

/**
 * Safe-Net Main Application Module
 * 
 * 完整功能模組：
 * - Auth: JWT 認證和授權
 * - Tenants: 社區管理（6 個端點）
 * - Elders: 長者管理（7 個端點）
 * - Devices: 設備管理（6 個端點）
 * - Gateways: 接收點管理（5 個端點）
 * - Logs: 訊號記錄（2 個端點，含 Gateway 上傳）
 * - Alerts: 警報管理（6 個端點）
 * - Dashboard: 統計數據（4 個端點）
 * 
 * 總計：39 個 API 端點
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    AuthModule,
    AppAuthModule,
    AppTenantsModule,
    AppEldersModule,
    AppAlertsModule,
    AppUsersModule,
    PushNotificationsModule,
    TenantsModule,
    UsersModule,
    EldersModule,
    DevicesModule,
    GatewaysModule,
    LogsModule,
    AlertsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 全域 Guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // 全域 Filters
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // 全域 Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
