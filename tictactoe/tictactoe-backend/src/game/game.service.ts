import { Injectable } from '@nestjs/common';
import { JoinInternalDto } from '../../../dto/game/join.input.internal.dto';
import { QueueService } from 'src/queue/queue.service';
import { SessionService } from 'src/session/session.service';
import { Server } from 'socket.io';
import {
  AFTER_MOVE,
  GAME_DRAW,
  GAME_FOUND,
  GAME_LOST,
  GAME_WON,
  OPPONENT_LEFT,
} from '../../../socket.messages';
import MoveInternalDto from '../../../dto/game/move.internal.dto';
import { hasWon, isDraw, nextTurn, validateMove } from './game.utils';
import SessionOutputDto from '../../../dto/session/session.output.dto';
import AfterMoveOutputDto from '../../../dto/game/after-move.output.dto';

@Injectable()
export class GameService {
  constructor(
    private readonly queueService: QueueService,
    private readonly sessionService: SessionService,
  ) {}

  async join(data: JoinInternalDto, server: Server): Promise<void> {
    const oldest = await this.queueService.findOldest();
    if (!oldest) {
      this.queueService.create({
        playerSocketId: data.socketId,
        playerUsername: data.username,
      });
    } else {
      await this.queueService.removeBySocketId(oldest.playerSocketId);
      const session = {
        p1socketId: oldest.playerSocketId,
        p1username: oldest.playerUsername,
        p2socketId: data.socketId,
        p2username: data.username,
      };
      const createdSession = await this.sessionService.create(session);

      const player1response: SessionOutputDto = {
        turn: createdSession.turn,
        gamestate: createdSession.gamestate,
        symbol: createdSession.p1symbol,
      };

      const player2response: SessionOutputDto = {
        turn: createdSession.turn,
        gamestate: createdSession.gamestate,
        symbol: createdSession.p2symbol,
      };

      server.to(oldest.playerSocketId).emit(GAME_FOUND, player1response);
      server.to(data.socketId).emit(GAME_FOUND, player2response);
    }
  }

  async move(data: MoveInternalDto, server: Server) {
    //is it the player's turn?
    const { socketId, newGamestate } = data;
    const session = await this.sessionService.findBySocketId(socketId);

    if (!session) {
      console.log('Session not found');
      return;
    }

    if (session.p1socketId != socketId && session.p2socketId != socketId) {
      console.log('Player not in session');
      return;
    }

    const currentPlayer = session.p1socketId === socketId ? 'p1' : 'p2';
    const concurrentPlayer = currentPlayer === 'p1' ? 'p2' : 'p1';

    const currentSymbol = session[`${currentPlayer}symbol`];

    if (session.turn != currentSymbol) {
      console.log(`${currentPlayer} tried to move out of turn`);
      return;
    }

    const isMoveValid = validateMove(session.gamestate, newGamestate);

    if (!isMoveValid) {
      console.log('Move is invalid');
      return;
    }

    const isWinner = hasWon(newGamestate, currentSymbol);
    const gameOver = isDraw(newGamestate);
    if (isWinner || gameOver) {
      await this.sessionService.removeBySocketId(socketId);

      if (isWinner) {
        server.to(session[`${concurrentPlayer}socketId`]).emit(GAME_LOST);
        server.to(session[`${currentPlayer}socketId`]).emit(GAME_WON);
        return;
      }
      server.to(session.p1socketId).emit(GAME_DRAW);
      server.to(session.p2socketId).emit(GAME_DRAW);
      return;
    }

    const newTurn = nextTurn(session.turn);
    await this.sessionService.updateGamestateById(session.id, newGamestate);
    await this.sessionService.updateTurnById(session.id, newTurn);

    const afterMoveState: AfterMoveOutputDto = {
      gamestate: newGamestate,
      turn: newTurn,
    };

    server
      .to([session.p1socketId, session.p2socketId])
      .emit(AFTER_MOVE, afterMoveState);
  }

  async disconnect(socketId: string, server: Server): Promise<void> {
    await this.queueService.removeBySocketId(socketId);
    const session = await this.sessionService.findBySocketId(socketId);
    if (session) {
      if (session.p1socketId === socketId) {
        server.to(session.p2socketId).emit(OPPONENT_LEFT);
      } else {
        server.to(session.p1socketId).emit(OPPONENT_LEFT);
      }
      await this.sessionService.removeBySocketId(socketId);
    }
  }
}
