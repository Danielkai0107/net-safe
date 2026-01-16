import { Module } from '@nestjs/common';
import { AppAlertsService } from './app-alerts.service';
import { AppAlertsController } from './app-alerts.controller';
import { DatabaseModule } from '../database/database.module';
import { PushNotificationsModule } from '../push-notifications/push-notifications.module';

@Module({
  imports: [DatabaseModule, PushNotificationsModule],
  controllers: [AppAlertsController],
  providers: [AppAlertsService],
  exports: [AppAlertsService],
})
export class AppAlertsModule {}
