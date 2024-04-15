import { Injectable } from '@nestjs/common';
import { SessionRepository } from './session.repository';
import SessionInternalDto, {
  SessionDto,
} from '../../../dto/session/session.internal.dto';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async create(data: SessionInternalDto): Promise<SessionDto> {
    return await this.sessionRepository.create(data);
  }

  async findBySocketId(socketId: string): Promise<SessionDto> {
    return await this.sessionRepository.findBySocketId(socketId);
  }

  async removeBySocketId(socketId: string): Promise<void> {
    await this.sessionRepository.removeBySocketId(socketId);
  }

  async updateGamestateById(
    id: string,
    gamestate: string,
  ): Promise<SessionDto> {
    return await this.sessionRepository.updateGamestateById(id, gamestate);
  }

  async updateTurnById(id: string, turn: string): Promise<SessionDto> {
    return await this.sessionRepository.updateTurnById(id, turn);
  }
}
