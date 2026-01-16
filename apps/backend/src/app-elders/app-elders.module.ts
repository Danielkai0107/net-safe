import { Module } from '@nestjs/common';
import { AppEldersService } from './app-elders.service';
import { AppEldersController } from './app-elders.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AppEldersController],
  providers: [AppEldersService],
  exports: [AppEldersService],
})
export class AppEldersModule {}
