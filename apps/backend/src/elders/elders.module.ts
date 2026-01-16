import { Module } from '@nestjs/common';
import { EldersService } from './elders.service';
import { EldersController } from './elders.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EldersController],
  providers: [EldersService],
  exports: [EldersService],
})
export class EldersModule {}
