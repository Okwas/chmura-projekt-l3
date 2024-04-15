import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import QueueInternalDto from '../../../dto/queue/queue.internal.dto';

@Injectable()
export class QueueRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async create(data: QueueInternalDto): Promise<void> {
    await this.prismaClient.queue.create({ data });
  }

  async findOldest(): Promise<QueueInternalDto> {
    return await this.prismaClient.queue.findFirst({
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async removeBySocketId(socketId: string): Promise<void> {
    await this.prismaClient.queue.deleteMany({
      where: {
        playerSocketId: socketId,
      },
    });
  }
}
