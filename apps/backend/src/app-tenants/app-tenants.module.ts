import { Module } from '@nestjs/common';
import { AppTenantsService } from './app-tenants.service';
import { AppTenantsController } from './app-tenants.controller';
import { DatabaseModule } from '../database/database.module';
import { TenantAdminGuard } from './guards/tenant-admin.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [AppTenantsController],
  providers: [AppTenantsService, TenantAdminGuard],
  exports: [AppTenantsService],
})
export class AppTenantsModule {}
