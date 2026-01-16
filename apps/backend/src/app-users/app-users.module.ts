import { Module } from '@nestjs/common';
import { AppUsersService } from './app-users.service';
import { AppUsersController } from './app-users.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AppUsersController],
  providers: [AppUsersService],
  exports: [AppUsersService],
})
export class AppUsersModule {}
