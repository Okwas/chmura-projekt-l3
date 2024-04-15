import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import SessionInternalDto, {
  SessionDto,
} from '../../../dto/session/session.internal.dto';

@Injectable()
export class SessionRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async create(data: SessionInternalDto): Promise<SessionDto> {
    return await this.prismaClient.session.create({ data });
  }

  async findBySocketId(socketId: string): Promise<SessionDto> {
    return await this.prismaClient.session.findFirst({
      where: {
        OR: [{ p1socketId: socketId }, { p2socketId: socketId }],
      },
    });
  }

  async removeBySocketId(socketId: string): Promise<void> {
    await this.prismaClient.session.deleteMany({
      where: {
        OR: [{ p1socketId: socketId }, { p2socketId: socketId }],
      },
    });
  }

  async updateGamestateById(
    id: string,
    gamestate: string,
  ): Promise<SessionDto> {
    return await this.prismaClient.session.update({
      where: { id },
      data: { gamestate },
    });
  }

  async updateTurnById(id: string, turn: string): Promise<SessionDto> {
    return await this.prismaClient.session.update({
      where: { id },
      data: { turn },
    });
  }
}
