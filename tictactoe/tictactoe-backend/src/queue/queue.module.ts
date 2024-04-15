import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueRepository } from './queue.repository';

@Module({
  providers: [QueueService, QueueRepository],
  exports: [QueueService],
})
export class QueueModule {}
