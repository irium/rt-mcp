import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RutrackerService } from './rutracker.service';
import { RutrackerController } from './rutracker.controller';

@Module({
  imports: [ConfigModule],
  providers: [RutrackerService],
  controllers: [RutrackerController],
  exports: [RutrackerService],
})
export class RutrackerModule {}
