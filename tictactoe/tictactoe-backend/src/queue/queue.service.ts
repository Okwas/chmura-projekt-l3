import { Injectable } from '@nestjs/common';
import { QueueRepository } from './queue.repository';
import QueueInternalDto from '../../../dto/queue/queue.internal.dto';

@Injectable()
export class QueueService {
  constructor(private readonly queueRepository: QueueRepository) {}

  async create(data: QueueInternalDto): Promise<void> {
    this.queueRepository.create(data);
  }

  async findOldest(): Promise<QueueInternalDto> {
    return this.queueRepository.findOldest();
  }

  async removeBySocketId(socketId: string): Promise<void> {
    this.queueRepository.removeBySocketId(socketId);
  }
}
